from datetime import datetime, date, UTC
from enum import Enum
from typing import Optional, Dict, List

from beanie import Document, Indexed, Link
from pydantic import Field, field_validator

from ..models.user import User

class Currency(str, Enum):
    """Devises supportées par l'application bancaire"""
    USD = "USD"  # Dollar américain (devise par défaut)
    EUR = "EUR"  # Euro
    XOF = "XOF"  # Franc CFA (BCEAO)


class TransactionType(str, Enum):
    """Types de transactions supportés"""
    DEPOSIT = "deposit"     # Dépôt
    WITHDRAWAL = "withdrawal"  # Retrait
    TRANSFER = "transfer"   # Transfert entre utilisateurs


class TransactionStatus(str, Enum):
    """États possibles d'une transaction"""
    PENDING = "pending"     # En attente
    COMPLETED = "completed" # Terminée
    FAILED = "failed"       # Échouée


class CardType(str, Enum):
    """Types de cartes disponibles"""
    DEBIT = "debit"     # Carte de débit
    VIRTUAL = "virtual" # Carte virtuelle


class CardStatus(str, Enum):
    """États possibles d'une carte"""
    ACTIVE = "active"       # Active
    INACTIVE = "inactive"   # Inactive
    BLOCKED = "blocked"     # Bloquée
    EXPIRED = "expired"     # Expirée


class ExchangeRate(Document):
    """Modèle pour stocker les taux de change"""
    base_currency: Currency = Currency.USD
    rates: Dict[str, float]  # {"EUR": 0.93, "XOF": 607.5}
    last_updated: datetime = Field(default_factory=lambda: datetime.now(UTC))

    class Settings:
        name = "exchange_rates"

    class Config:
        use_enum_values = True


class Account(Document):
    """Modèle de compte bancaire (un seul compte courant par utilisateur)"""
    user: Link[User]
    account_number: Indexed(str, unique=True)
    account_name: str = Field(default="Compte Principal")
    balance: float = 0.0
    currency: Currency = Currency.USD
    is_active: bool = True
    is_primary: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    last_transaction: Optional[datetime] = None

    class Settings:
        name = "accounts"
        indexes = [
            [("user.id", 1)],
            [("account_number", 1)],
        ]

    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }

    async def get_user(self) -> User:
        """Récupérer l'utilisateur lié à ce compte"""
        return await self.user.fetch()


class Transaction(Document):
    """Modèle de transaction pour l'application bancaire"""
    transaction_id: Indexed(str, unique=True)
    account: Link[Account]
    transaction_type: TransactionType
    amount: float
    currency: Currency = Currency.USD
    description: str
    status: TransactionStatus = TransactionStatus.PENDING

    # Champs spécifiques aux transferts
    recipient_account: Optional[Link[Account]] = None
    recipient_name: Optional[str] = None
    recipient_account_number: Optional[str] = None

    # Horodatage
    transaction_date: datetime = Field(default_factory=lambda: datetime.now(UTC))
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    class Settings:
        name = "transactions"

    class Config:
        use_enum_values = True


class Card(Document):
    """Modèle de carte bancaire"""
    user: Link[User]
    card_number: Indexed(str, unique=True)
    card_type: CardType
    card_name: str
    expiry_date: date
    cvv: str
    is_contactless: bool = True
    daily_limit: float
    status: CardStatus = CardStatus.ACTIVE

    # Champs spécifiques aux cartes virtuelles
    is_virtual: bool = False
    purpose: Optional[str] = None

    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    class Settings:
        name = "cards"

    class Config:
        use_enum_values = True