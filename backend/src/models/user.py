from datetime import datetime, UTC
from enum import Enum
from typing import List, Optional

from beanie import Document, Indexed
from pydantic import EmailStr, Field


class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"
    STUDENT = "student"
    BANKING_USER = "banking_user"


class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"


class User(Document):
    """Base User model for all applications"""
    username: Indexed(str, unique=True)
    email: Indexed(EmailStr, unique=True)
    full_name: Indexed(str)
    hashed_password: str
    profile_image: Optional[str] = None
    phone: Optional[str] = None
    roles: List[UserRole] = [UserRole.USER]
    status: UserStatus = UserStatus.ACTIVE

    # User app preferences
    uses_student_app: bool = False
    uses_banking_app: bool = False
    uses_clothes_app: bool = False

    # Verification and security
    is_email_verified: bool = False
    is_phone_verified: bool = False
    verification_code: Optional[str] = None
    verification_code_expiry: Optional[datetime] = None

    # OAuth integration
    oauth_provider: Optional[str] = None
    oauth_user_id: Optional[str] = None

    # Audit fields
    created_at: datetime = Field(default_factory=lambda : datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda : datetime.now(UTC))
    last_login: Optional[datetime] = None

    class Settings:
        name = "users"
        indexes = [
            [("status", 1), ("is_email_verified", 1), ("uses_banking_app", 1)],
            [("username", "text"), ("full_name", "text"), ("email", "text")]
        ]

    class Config:
        use_enum_values = True
        validate_assignment = True


    def update_login_timestamp(self):
        """Update the last login timestamp"""
        self.last_login = datetime.now(UTC)
        return self

    def update_timestamp(self):
        """Update the updated_at timestamp"""
        self.updated_at = datetime.now(UTC)
        return self