from datetime import datetime, date, UTC
from enum import Enum
from typing import Optional

from beanie import Document, Indexed, Link
from pydantic import Field, field_validator

from ..models.user import User


class AccountType(str, Enum):
    CHECKING = "checking"
    SAVINGS = "savings"
    CREDIT = "credit"
    INVESTMENT = "investment"


class TransactionType(str, Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    TRANSFER = "transfer"
    PAYMENT = "payment"
    FEE = "fee"
    INTEREST = "interest"
    REFUND = "refund"


class TransactionStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class CardType(str, Enum):
    DEBIT = "debit"
    CREDIT = "credit"
    VIRTUAL = "virtual"


class CardStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    BLOCKED = "blocked"
    EXPIRED = "expired"


class Account(Document):
    """Bank account model for the banking app"""
    user: Link[User]
    account_number: Indexed(str, unique=True)
    account_name: str
    account_type: AccountType
    balance: float = 0.0
    currency: str = "USD"
    is_primary: bool = False
    is_active: bool = True

    # Credit account fields
    credit_limit: Optional[float] = None
    available_credit: Optional[float] = None
    interest_rate: Optional[float] = None

    # Savings account fields
    interest_rate_savings: Optional[float] = None

    created_at: datetime = Field(default_factory=lambda : datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda : datetime.now(UTC))
    last_transaction: Optional[datetime] = None

    class Settings:
        name = "accounts"

    class Config:
        use_enum_values = True

    @field_validator('account_number')
    @classmethod
    def validate_account_number(cls, v):
        if not v or len(v) < 8:
            raise ValueError('Account number must be at least 8 characters')
        return v


class Transaction(Document):
    """Transaction model for the banking app"""
    transaction_id: Indexed(str, unique=True)
    account: Link[Account]
    transaction_type: TransactionType
    amount: float
    currency: str = "USD"
    description: str
    category: Optional[str] = None  # e.g., "groceries", "entertainment", "utilities"
    status: TransactionStatus = TransactionStatus.PENDING

    # Transfer specific fields
    recipient_account: Optional[Link[Account]] = None
    recipient_name: Optional[str] = None
    recipient_account_number: Optional[str] = None

    # Location data
    merchant_name: Optional[str] = None
    merchant_category: Optional[str] = None
    location: Optional[str] = None

    # Timestamps
    transaction_date: datetime = Field(default_factory=lambda : datetime.now(UTC))
    created_at: datetime = Field(default_factory=lambda : datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda : datetime.now(UTC))

    class Settings:
        name = "transactions"

    class Config:
        use_enum_values = True


class TransferBeneficiary(Document):
    """Saved beneficiary for transfers"""
    user: Link[User]
    beneficiary_name: str
    account_number: str
    bank_name: Optional[str] = None
    bank_code: Optional[str] = None
    is_favorite: bool = False
    created_at: datetime = Field(default_factory=lambda : datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda : datetime.now(UTC))

    class Settings:
        name = "beneficiaries"


class Card(Document):
    """Bank card model for the banking app"""
    user: Link[User]
    account: Link[Account]
    card_number: Indexed(str, unique=True)
    card_type: CardType
    card_name: str
    expiry_date: date
    cvv: str  # In a real app, this would be stored securely or not at all
    is_contactless: bool = True
    daily_limit: float
    status: CardStatus = CardStatus.ACTIVE

    # Virtual card specific fields
    is_virtual: bool = False
    purpose: Optional[str] = None  # e.g., "online shopping", "subscription"

    created_at: datetime = Field(default_factory=lambda : datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda : datetime.now(UTC))

    class Settings:
        name = "cards"

    class Config:
        use_enum_values = True