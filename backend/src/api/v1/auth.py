from datetime import datetime, timedelta, UTC
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr

from ...models.user import User, UserRole, UserStatus
from ...config.settings import get_settings
from ...utils.security import get_password_hash, verify_password

settings = get_settings()
router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/token")


class Credentials(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int


class TokenData(BaseModel):
    username: Optional[str] = None
    roles: List[str] = []


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    password: str
    phone: Optional[str] = None
    uses_student_app: bool = False
    uses_banking_app: bool = False
    uses_clothes_app: bool = False


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


def create_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now(UTC) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username, roles=payload.get("roles", []))
    except JWTError:
        raise credentials_exception

    user = await User.find_one(User.username == token_data.username)
    if user is None:
        raise credentials_exception
    if user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User account is {user.status}"
        )
    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.status != UserStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Inactive user")
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


@router.post("/register", response_model=UserResponse)
async def register_user(user_data: UserCreate):
    # Check if username or email already exists
    existing_user = await User.find_one({
        "$or": [
            {"username": user_data.username},
            {"email": user_data.email}
        ]
    })

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )

    # Determine roles based on selected apps
    roles = [UserRole.USER]
    if user_data.uses_student_app:
        roles.append(UserRole.STUDENT)
    if user_data.uses_banking_app:
        roles.append(UserRole.BANKING_USER)

    # Create new user
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=get_password_hash(user_data.password),
        phone=user_data.phone,
        roles=roles,
        uses_student_app=user_data.uses_student_app,
        uses_banking_app=user_data.uses_banking_app,
        uses_clothes_app=user_data.uses_clothes_app,
    )

    await new_user.insert()

    # Convert to response model
    return UserResponse(
        id=str(new_user.id),
        username=new_user.username,
        email=new_user.email,
        full_name=new_user.full_name,
        profile_image=new_user.profile_image,
        phone=new_user.phone,
        roles=[role for role in new_user.roles],
        status=new_user.status,
        uses_student_app=new_user.uses_student_app,
        uses_banking_app=new_user.uses_banking_app,
        uses_clothes_app=new_user.uses_clothes_app,
        created_at=new_user.created_at,
        last_login=new_user.last_login
    )


@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: Credentials):
    # Find user
    user = await User.find_one(User.username == form_data.username)

    # Validate credentials
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

    # Create access token
    access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token_data = {
        "sub": user.username,
        "roles": [role for role in user.roles],
        "type": "access"
    }
    access_token = create_token(
        data=access_token_data,
        expires_delta=access_token_expires
    )

    # Create refresh token
    refresh_token_expires = timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token_data = {
        "sub": user.username,
        "type": "refresh"
    }
    refresh_token = create_token(
        data=refresh_token_data,
        expires_delta=refresh_token_expires
    )

    # Update last login
    user.last_login = datetime.now(UTC)
    await user.save()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }


@router.post("/refresh-token", response_model=Token)
async def refresh_token(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode the token
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])

        # Check token type
        if payload.get("type") != "refresh":
            raise credentials_exception

        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    # Get user
    user = await User.find_one(User.username == username)
    if user is None or user.status != UserStatus.ACTIVE:
        raise credentials_exception

    # Create new access token
    access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token_data = {
        "sub": user.username,
        "roles": [role for role in user.roles],
        "type": "access"
    }
    access_token = create_token(
        data=access_token_data,
        expires_delta=access_token_expires
    )

    # Create new refresh token
    refresh_token_expires = timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token_data = {
        "sub": user.username,
        "type": "refresh"
    }
    refresh_token = create_token(
        data=refresh_token_data,
        expires_delta=refresh_token_expires
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }


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