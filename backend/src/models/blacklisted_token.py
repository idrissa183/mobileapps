from datetime import datetime, UTC

from beanie import Document
from pydantic import Field


class BlacklistedToken(Document):
    token: str
    jti: str
    user_id: str
    expires_at: datetime
    blacklisted_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    class Settings:
        name = "blacklisted_tokens"
        indexes = [
            "jti",
            "user_id",
            [("expires_at", 1)],
        ]