from typing import Optional, Dict, Any

from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from ..config.settings import get_settings
from ..models.user import User, UserStatus

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/token")


async def get_current_user_from_token(token: str) -> Optional[User]:
    """Validate token and return User if valid"""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        username: str = payload.get("sub")
        if username is None:
            return None

        # Token type should be "access"
        token_type = payload.get("type")
        if token_type != "access":
            return None

    except JWTError:
        return None

    # Get user from database
    user = await User.find_one(User.username == username)
    if user is None or user.status != UserStatus.ACTIVE:
        return None

    return user


async def validate_oauth_provider_token(
        provider: str, token: str, user_info: Dict[str, Any]
) -> bool:
    """
    Validate an OAuth provider token and user info

    This is a placeholder. In a real implementation, this would
    verify the token with the OAuth provider.
    """
    # Implement the validation logic for each provider
    if provider == "google":
        # Validate Google token
        # Example: make a request to Google's tokeninfo endpoint
        return True
    elif provider == "facebook":
        # Validate Facebook token
        return True
    elif provider == "apple":
        # Validate Apple token
        return True

    return False


async def get_oauth_user_info(provider: str, token: str) -> Optional[Dict[str, Any]]:
    """
    Get user info from OAuth provider

    This is a placeholder. In a real implementation, this would
    make a request to the OAuth provider to get user information.
    """
    # Implement the logic to get user info for each provider
    if provider == "google":
        # Example: make a request to Google's userinfo endpoint
        return {
            "id": "google_user_id",
            "email": "user@example.com",
            "name": "User Name",
            # Other provider-specific fields
        }
    elif provider == "facebook":
        # Get Facebook user info
        return {
            "id": "facebook_user_id",
            "email": "user@example.com",
            "name": "User Name",
            # Other provider-specific fields
        }
    elif provider == "apple":
        # Get Apple user info
        return {
            "id": "apple_user_id",
            "email": "user@example.com",
            "name": "User Name",
            # Other provider-specific fields
        }

    return None