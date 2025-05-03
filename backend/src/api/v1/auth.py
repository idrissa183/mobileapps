import secrets
import string
import logging
from datetime import datetime, timedelta, UTC
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Response
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr, field_validator

from ...models.banking import Account, Currency
from ...models.blacklisted_token import BlacklistedToken
from ...models.user import User, UserRole, UserStatus
from ...config.settings import get_settings
from ...utils.email import send_password_reset_email, send_otp_email
from ...utils.security import get_password_hash, verify_password


logger = logging.getLogger(__name__)

settings = get_settings()
router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/token")


class Credentials(BaseModel):
    username: str
    password: str



class TokenData(BaseModel):
    username: Optional[str] = None
    roles: List[str] = []
    token_type: str = "access"
    jti: Optional[str] = None


class OTPVerification(BaseModel):
    email: EmailStr
    otp_code: str

class PasswordReset(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    email: EmailStr
    reset_code: str
    new_password: str

    @field_validator('new_password')
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    password: str
    phone: Optional[str] = None
    uses_student_app: bool = True
    uses_banking_app: bool = True
    uses_clothes_app: bool = True

    @field_validator('password')
    @classmethod
    def password_strength(cls, v):
        validate_password_strength(v)
        return v

    @field_validator('username')
    @classmethod
    def username_format(cls, v):
        if not v.isalnum() or len(v) < 3:
            raise ValueError('Username must be alphanumeric and at least 3 characters')
        return v


class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr
    full_name: str
    profile_image: Optional[str] = None
    phone: Optional[str] = None
    roles: List[str]
    status: str
    uses_student_app: bool
    uses_banking_app: bool
    uses_clothes_app: bool
    created_at: datetime
    last_login: Optional[datetime] = None


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
    user: UserResponse


def validate_password_strength(password: str) -> str:
    """Validate password strength criteria"""
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")

    # Check for at least one uppercase, one lowercase, and one digit
    has_upper = any(char.isupper() for char in password)
    has_lower = any(char.islower() for char in password)
    has_digit = any(char.isdigit() for char in password)
    has_special = any(char in string.punctuation for char in password)

    if not (has_upper and has_lower and has_digit and has_special):
        raise ValueError("Password must contain at least one uppercase letter, one lowercase letter, one digit and one special character")

    return password


def generate_otp():
    return ''.join(secrets.choice(string.digits) for _ in range(6))


def generate_reset_code():
    return secrets.token_urlsafe(24)


def generate_jwt_id() -> str:
    return secrets.token_hex(16)


async def is_token_blacklisted(token: str, jti: str) -> bool:
    blacklisted = await BlacklistedToken.find_one(BlacklistedToken.jti == jti)
    return blacklisted is not None


def create_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now(UTC) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    to_encode.update({"iat": datetime.now(UTC)})
    if "jti" not in to_encode:
        to_encode.update({"jti": generate_jwt_id()})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


async def validate_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )

        jti = payload.get("jti")
        if not jti:
            raise JWTError("Missing JWT ID")

        if await is_token_blacklisted(token, jti):
            raise JWTError("Token has been revoked")

        return payload

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """Get the current user from a JWT token"""
    try:
        # Validate the token
        payload = await validate_token(token)

        # Extract user data
        username: str = payload.get("sub")
        if username is None:
            raise JWTError("Username missing from token")

        # Get token type
        token_type = payload.get("type", "access")
        if token_type != "access":
            raise JWTError("Not an access token")

        # Create token data
        token_data = TokenData(
            username=username,
            roles=payload.get("roles", []),
            token_type=token_type,
            jti=payload.get("jti")
        )

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user from database
    user = await User.find_one(User.username == token_data.username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check user status
    if user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User account is {user.status}"
        )

    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.status != UserStatus.ACTIVE:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    return current_user


def check_user_role(required_roles: List[UserRole]):
    async def _check_user_role(current_user: User = Depends(get_current_active_user)) -> User:
        for role in required_roles:
            if role in current_user.roles:
                return current_user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions",
        )

    return _check_user_role


async def create_bank_account_for_user(user: User):
    """Créer un compte bancaire pour un utilisateur"""
    try:
        existing_account = await Account.find_one(Account.user == user)
        if existing_account:
            logger.info(f"User {user.id} already has a bank account")
            return existing_account

        user_id_str = str(user.id)
        account_number = f"AC{datetime.now(UTC).strftime('%Y%m%d')}{user_id_str[-6:].upper()}"
        account = Account(
            user=user,
            account_number=account_number,
            balance=0.0,
            currency=Currency.USD,
            is_active=True
        )
        await account.insert()
        logger.info(f"Bank account created for user {user.id}")
        return account

    except Exception as e:
        logger.error(f"Error creating bank account for user {user.id}: {str(e)}")
        # Re-lever l'exception pour que l'erreur soit visible
        raise


@router.post("/register", response_model=Dict[str, str])
async def register_user(user_data: UserCreate,  background_tasks: BackgroundTasks):
    # Check if username or email already exists
    existing_user = await User.find_one({
        "$or": [
            {"username": user_data.username},
            {"email": user_data.email}
        ]
    })

    if existing_user:
        if existing_user.username == user_data.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

    # Determine roles based on selected apps
    # roles = [UserRole.USER]
    # if user_data.uses_student_app:
    #     roles.append(UserRole.STUDENT)
    # if user_data.uses_banking_app:
    #     roles.append(UserRole.BANKING_USER)

    roles = [UserRole.BANKING_USER]
    if user_data.uses_student_app:
        roles.append(UserRole.STUDENT)

    otp_code = generate_otp()
    otp_expiry = datetime.now(UTC) + timedelta(minutes=1)

    new_user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=get_password_hash(user_data.password),
        phone=user_data.phone,
        roles=roles,
        status=UserStatus.PENDING,
        uses_student_app=user_data.uses_student_app,
        uses_banking_app=user_data.uses_banking_app,
        uses_clothes_app=user_data.uses_clothes_app,
        verification_code=otp_code,
        verification_code_expiry=otp_expiry,
    )

    try:
        # Save user to database
        await new_user.insert()

        # Send OTP email
        background_tasks.add_task(
            send_otp_email,
            recipient_email=str(user_data.email),
            recipient_name=user_data.full_name,
            otp_code=otp_code
        )

        return {
            "message": "Registration initiated. Please check your email for OTP verification."
        }

    except Exception as e:
        # Log error
        logger.error(f"Error registering user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error registering user. Please try again later."
        )


@router.post("/verify-otp", response_model=UserResponse)
async def verify_otp(verification_data: OTPVerification, background_tasks: BackgroundTasks):
    """Vérifier le code OTP et activer le compte utilisateur"""

    user = await User.find_one(User.email == verification_data.email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if user.status != UserStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is not pending verification"
        )

    if not user.verification_code or user.verification_code != verification_data.otp_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code"
        )

    if not user.verification_code_expiry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP code has expired"
        )

    expiry_time = user.verification_code_expiry
    if expiry_time.tzinfo is None:
        expiry_time = expiry_time.replace(tzinfo=UTC)

    if expiry_time < datetime.now(UTC):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP code has expired"
        )

    try:
        # Activate user account
        user.status = UserStatus.ACTIVE
        user.is_email_verified = True
        user.verification_code = None
        user.verification_code_expiry = None
        user.updated_at = datetime.now(UTC)

        await user.save()

        if user.uses_banking_app and UserRole.BANKING_USER in user.roles:
            background_tasks.add_task(create_bank_account_for_user, user)

        return UserResponse(
            id=str(user.id),
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            profile_image=user.profile_image,
            phone=user.phone,
            roles=[role for role in user.roles],
            status=user.status,
            uses_student_app=user.uses_student_app,
            uses_banking_app=user.uses_banking_app,
            uses_clothes_app=user.uses_clothes_app,
            created_at=user.created_at,
            last_login=user.last_login
        )

    except Exception as e:
        logger.error(f"Error verifying OTP: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error verifying OTP. Please try again later."
        )


@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: Credentials):
    """Login and get access and refresh tokens"""
    # Find user by username
    user = await User.find_one(User.username == form_data.username)

    # Validate credentials with constant-time comparison
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user is active
    if user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User account is {user.status}"
        )

    try:
        # Generate JWT ID
        jwt_id = generate_jwt_id()

        # Create access token
        access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token_data = {
            "sub": user.username,
            "roles": [role for role in user.roles],
            "type": "access",
            "jti": jwt_id,
            "user_id": str(user.id)
        }
        access_token = create_token(
            data=access_token_data,
            expires_delta=access_token_expires
        )

        # Create refresh token
        refresh_token_expires = timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
        refresh_token_data = {
            "sub": user.username,
            "type": "refresh",
            "jti": generate_jwt_id(),
            "user_id": str(user.id)
        }
        refresh_token = create_token(
            data=refresh_token_data,
            expires_delta=refresh_token_expires
        )

        # Update last login timestamp
        user.last_login = datetime.now(UTC)
        await user.save()

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": UserResponse(
                id=str(user.id),
                username=user.username,
                email=user.email,
                full_name=user.full_name,
                phone=user.phone,
                profile_image=user.profile_image,
                roles=[role for role in user.roles],
                status=user.status,
                uses_student_app=user.uses_student_app,
                uses_banking_app=user.uses_banking_app,
                uses_clothes_app=user.uses_clothes_app,
                created_at=user.created_at,
                last_login=user.last_login,
            )
        }

    except Exception as e:
        # Log error
        logger.error(f"Error generating tokens: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error generating tokens. Please try again later."
        )


@router.post("/refresh-token", response_model=Token)
async def refresh_token(token: str = Depends(oauth2_scheme)):
    """Refresh an access token using a refresh token"""
    try:
        # Validate the token
        payload = await validate_token(token)

        # Check token type
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not a refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Get username from token
        username = payload.get("sub")
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Get user from database
        user = await User.find_one(User.username == username)
        if not user or user.status != UserStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Get JWT ID
        jti = payload.get("jti")

        # Add refresh token to blacklist
        blacklisted_token = BlacklistedToken(
            token=token,
            jti=jti,
            user_id=str(user.id),
            expires_at=datetime.fromtimestamp(payload.get("exp"), UTC)
        )
        await blacklisted_token.insert()

        # Create new access token
        access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token_data = {
            "sub": user.username,
            "roles": [role for role in user.roles],
            "type": "access",
            "jti": generate_jwt_id(),
            "user_id": str(user.id)
        }
        access_token = create_token(
            data=access_token_data,
            expires_delta=access_token_expires
        )

        # Create new refresh token
        refresh_token_expires = timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
        refresh_token_data = {
            "sub": user.username,
            "type": "refresh",
            "jti": generate_jwt_id(),
            "user_id": str(user.id)
        }
        refresh_token = create_token(
            data=refresh_token_data,
            expires_delta=refresh_token_expires
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": UserResponse(
                id=str(user.id),
                username=user.username,
                email=user.email,
                full_name=user.full_name,
                phone=user.phone,
                profile_image=user.profile_image,
                roles=[role for role in user.roles],
                status=user.status,
                uses_student_app=user.uses_student_app,
                uses_banking_app=user.uses_banking_app,
                uses_clothes_app=user.uses_clothes_app,
                created_at=user.created_at,
                last_login=user.last_login,
            )
        }

    except HTTPException:
        raise
    except Exception as e:
        # Log error
        logger.error(f"Error refreshing token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error refreshing token. Please try again later."
        )

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return UserResponse(
        id=str(current_user.id),
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        profile_image=current_user.profile_image,
        phone=current_user.phone,
        roles=[role for role in current_user.roles],
        status=current_user.status,
        uses_student_app=current_user.uses_student_app,
        uses_banking_app=current_user.uses_banking_app,
        uses_clothes_app=current_user.uses_clothes_app,
        created_at=current_user.created_at,
        last_login=current_user.last_login
    )


@router.post("/logout", response_model=Dict[str, str])
async def logout(response: Response, token: str = Depends(oauth2_scheme)):
    """Logout and revoke the current token"""
    try:
        # Validate the token
        payload = await validate_token(token)

        # Get expiration time
        exp_timestamp = payload.get("exp")
        if not exp_timestamp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token format"
            )

        # Get JWT ID
        jti = payload.get("jti")
        if not jti:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token format: missing JTI"
            )

        # Get user ID
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token format: missing user ID"
            )

        # Add token to blacklist
        expire_datetime = datetime.fromtimestamp(exp_timestamp, UTC)
        blacklisted_token = BlacklistedToken(
            token=token,
            jti=jti,
            user_id=user_id,
            expires_at=expire_datetime
        )
        await blacklisted_token.insert()

        # Clear cookies
        response.delete_cookie(key="access_token")
        response.delete_cookie(key="refresh_token")

        return {"message": "Successfully logged out"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error logging out: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error logging out. Please try again later."
        )


@router.post("/password-reset", response_model=Dict[str, str])
async def request_password_reset(reset_data: PasswordReset, background_tasks: BackgroundTasks):
    """Request a password reset"""
    try:
        # Find user by email
        user = await User.find_one(User.email == reset_data.email)

        # If user not found, return a generic message
        if not user:
            return {"message": "If your email exists in our system, you will receive a password reset link"}

        # Generate reset code
        reset_code = generate_reset_code()
        reset_expiry = datetime.now(UTC) + timedelta(hours=1)

        # Update user with reset code
        user.verification_code = reset_code
        user.verification_code_expiry = reset_expiry
        await user.save()

        # Send password reset email
        reset_url = f"{settings.FRONTEND_URL}/reset-password?email={user.email}&code={reset_code}"
        background_tasks.add_task(
            send_password_reset_email,
            recipient_email=user.email,
            recipient_name=user.full_name,
            reset_code=reset_code,
            reset_url=reset_url
        )

        return {"message": "If your email exists in our system, you will receive a password reset link"}

    except Exception as e:
        logger.error(f"Error requesting password reset: {str(e)}")
        return {"message": "If your email exists in our system, you will receive a password reset link"}


@router.post("/password-reset/confirm", response_model=Dict[str, str])
async def confirm_password_reset(reset_data: PasswordResetConfirm):
    """Confirm password reset with code and set new password"""
    try:
        # Find user by email
        user = await User.find_one(User.email == reset_data.email)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Verify reset code
        if not user.verification_code or user.verification_code != reset_data.reset_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid reset code"
            )

        # Check if reset code has expired
        if not user.verification_code_expiry or user.verification_code_expiry < datetime.now(UTC):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reset code has expired"
            )

        # Update password
        user.hashed_password = get_password_hash(reset_data.new_password)
        user.verification_code = None
        user.verification_code_expiry = None
        user.updated_at = datetime.now(UTC)

        await user.save()

        # Blacklist all existing tokens for this user
        # This will force re-login with new password
        await invalidate_all_user_tokens(str(user.id))

        return {"message": "Password has been reset successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resetting password: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error resetting password. Please try again later."
        )


async def invalidate_all_user_tokens(user_id: str) -> None:
    """Invalidate all tokens for a specific user"""
    try:
        await BlacklistedToken.find(BlacklistedToken.user_id == user_id).to_list()
        logger.info(f"Invalidating all tokens for user: {user_id}")
    except Exception as e:
        logger.error(f"Error invalidating user tokens: {str(e)}")


@router.post("/resend-otp", response_model=Dict[str, str])
async def resend_otp(email_data: PasswordReset, background_tasks: BackgroundTasks):
    """Resend OTP verification code"""
    try:
        # Find user by email
        user = await User.find_one(User.email == email_data.email)

        if not user:
            # Don't reveal if the user exists
            return {"message": "If your email exists in our system, you will receive a new verification code"}

        # Check if user is pending verification
        if user.status != UserStatus.PENDING:
            return {"message": "If your email exists in our system, you will receive a new verification code"}

        # Generate new OTP
        otp_code = generate_otp()
        otp_expiry = datetime.now(UTC) + timedelta(minutes=1)

        # Update user with new OTP
        user.verification_code = otp_code
        user.verification_code_expiry = otp_expiry
        await user.save()

        # Send OTP email
        background_tasks.add_task(
            send_otp_email,
            recipient_email=user.email,
            recipient_name=user.full_name,
            otp_code=otp_code
        )

        return {"message": "If your email exists in our system, you will receive a new verification code"}

    except Exception as e:
        # Log error but return generic message for security
        logger.error(f"Error resending OTP: {str(e)}")
        return {"message": "If your email exists in our system, you will receive a new verification code"}


@router.post("/change-password", response_model=Dict[str, str])
async def change_password(
        current_password: str,
        new_password: str,
        current_user: User = Depends(get_current_active_user)
):
    """Change password for authenticated user"""
    try:
        # Verify current password
        if not verify_password(current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )

        # Validate new password
        validate_password_strength(new_password)

        # Update password
        current_user.hashed_password = get_password_hash(new_password)
        current_user.updated_at = datetime.now(UTC)
        await current_user.save()

        # Blacklist all existing tokens for this user
        await invalidate_all_user_tokens(str(current_user.id))

        return {"message": "Password changed successfully"}

    except HTTPException:
        raise
    except ValueError as e:
        # Password validation error
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Log error
        logger.error(f"Error changing password: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error changing password. Please try again later."
        )


@router.post("/update-profile", response_model=UserResponse)
async def update_profile(
        profile_data: Dict[str, Any],
        current_user: User = Depends(get_current_active_user)
):
    """Update user profile information"""
    try:
        # Fields that can be updated
        allowed_fields = ["full_name", "phone", "profile_image"]

        # Update allowed fields
        for field in allowed_fields:
            if field in profile_data:
                setattr(current_user, field, profile_data[field])

        # Update timestamp
        current_user.updated_at = datetime.now(UTC)
        await current_user.save()

        return UserResponse(
            id=str(current_user.id),
            username=current_user.username,
            email=current_user.email,
            full_name=current_user.full_name,
            profile_image=current_user.profile_image,
            phone=current_user.phone,
            roles=[role for role in current_user.roles],
            status=current_user.status,
            uses_student_app=current_user.uses_student_app,
            uses_banking_app=current_user.uses_banking_app,
            uses_clothes_app=current_user.uses_clothes_app,
            created_at=current_user.created_at,
            last_login=current_user.last_login
        )

    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating profile. Please try again later."
        )