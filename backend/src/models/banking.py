from datetime import datetime, date, UTC
from enum import Enum
from typing import Optional, Dict, List

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


class Currency(str, Enum):
    """Devises supportées par l'application bancaire"""
    USD = "USD"  # Dollar américain
    EUR = "EUR"  # Euro
    GBP = "GBP"  # Livre sterling
    JPY = "JPY"  # Yen japonais
    CHF = "CHF"  # Franc suisse
    CAD = "CAD"  # Dollar canadien
    AUD = "AUD"  # Dollar australien
    CNY = "CNY"  # Yuan chinois
    HKD = "HKD"  # Dollar de Hong Kong
    SGD = "SGD"  # Dollar de Singapour
    XOF = "XOF"  # Franc CFA (BCEAO)
    AOA = "AOA"  # Kwanza angolais
    NGN = "NGN"  # Naira nigérian
    ZAR = "ZAR"  # Rand sud-africain
    EGP = "EGP"  # Livre égyptienne
    MAD = "MAD"  # Dirham marocain
    KES = "KES"  # Shilling kényan
    GHS = "GHS"  # Cedi ghanéen


class ExchangeRate(Document):
    """Modèle pour stocker les taux de change"""
    base_currency: str
    rates: Dict[str, float]
    last_updated: datetime = Field(default_factory=lambda: datetime.now(UTC))

    class Settings:
        name = "exchange_rates"

    class Config:
        use_enum_values = True


class CurrencyConversion(Document):
    """Modèle pour stocker l'historique des conversions de devises"""
    user_id: str
    from_currency: str
    to_currency: str
    amount: float
    converted_amount: float
    exchange_rate: float
    related_transaction_id: Optional[str] = None
    conversion_date: datetime = Field(default_factory=lambda: datetime.now(UTC))

    class Settings:
        name = "currency_conversions"

    class Config:
        use_enum_values = True


class Account(Document):
    """Bank account model for the banking app"""
    user: Link[User]
    account_number: Indexed(str, unique=True)
    account_name: str
    account_type: AccountType
    balance: float = 0.0
    currency: str = "USD"
    preferred_currencies: List[str] = Field(default=["USD"])  # Devises préférées pour ce compte
    currency_conversion_fee: float = 0.025
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
    cvv: str
    is_contactless: bool = True
    daily_limit: float
    status: CardStatus = CardStatus.ACTIVE

    # Virtual card specific fields
    is_virtual: bool = False
    purpose: Optional[str] = None

    created_at: datetime = Field(default_factory=lambda : datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda : datetime.now(UTC))

    class Settings:
        name = "cards"

    class Config:
        use_enum_values = True