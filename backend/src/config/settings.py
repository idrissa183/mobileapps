from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional, List


class Settings(BaseSettings):
    # Base config
    APP_NAME: str = "Multi-App Mobile API"
    APP_DESCRIPTION: str = "API Backend for Student, Banking, and Clothes Search Mobile Applications"
    API_PREFIX: str = "/api"
    DEBUG: bool = True
    VERSION: str = "0.1.0"

    # Security
    JWT_SECRET: str = "PVDlqCIiAso7KQPrh2aMhILs8JNKMz6L9QzEmEUnsCA"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database Configuration
    DB_TYPE: Optional[str] = None
    DB_HOST: Optional[str] = None
    DB_PORT: Optional[str] = None
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None
    DB_NAME: Optional[str] = None

    # MongoDB URI
    @property
    def MONGODB_URI(self) -> str:
        if self.DB_TYPE == "mongodb+srv":
            # For MongoDB Atlas
            return f"{self.DB_TYPE}://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}/?retryWrites=true&w=majority&appName=Cluster0"
        else:
            # For local MongoDB
            return f"{self.DB_TYPE}://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # CORS Settings
    CORS_ORIGINS: List[AnyHttpUrl] = [
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:19000",
        "http://localhost:19006",
        "https://banque-vgx0.onrender.com",
        "http://localhost:8081",
        "http://192.168.88.36:8081",
        "exp://192.168.88.36:8081",
        "exp://192.168.88.*:8081",
        "http://192.168.88.*:8081",
    ]

    @field_validator('CORS_ORIGINS')
    @classmethod
    def validate_cors_origins(cls, v):
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # AWS S3 for file storage (for clothes images and student documents)
    S3_BUCKET_NAME: str = "mobile-apps-storage"
    AWS_ACCESS_KEY_ID: str = "your-access-key"
    AWS_SECRET_ACCESS_KEY: str = "your-secret-key"
    AWS_REGION: str = "us-east-1"

    # SMS and Email configuration for banking notifications
    SMS_API_KEY: str = "your-sms-api-key"

    FRONTEND_URL: str = "http://localhost:3000"

    EMAIL_HOST: str = "smtp.gmail.com"
    EMAIL_PORT: int = 587
    EMAIL_USERNAME: str = "ouedraogoidrissa7108@gmail.com"
    EMAIL_PASSWORD: str = "hoqmmawnbybtpzdh"

    # Configuration pour l'API de taux de change
    EXCHANGE_API_BASE_URL: str = "https://open.er-api.com/v6/latest"
    EXCHANGE_RATE_CACHE_DURATION: int = 21600
    CURRENCY_CONVERSION_DEFAULT_FEE: float = 0.025

    # Application specific settings
    STUDENT_DEFAULT_CURRENCY: str = "USD"
    BANKING_TRANSFER_FEE_PERCENTAGE: float = 0.5
    CLOTHES_ITEMS_PER_PAGE: int = 20


    # OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[str] = None

    # Redirect URLs after OAuth authentication
    OAUTH_REDIRECT_URL: str = "exp://localhost:19000/--/oauth-callback"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()