from datetime import datetime, date, UTC, timedelta
from typing import List, Optional, Any, Dict, Tuple
import uuid

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, field_validator

from ..v1.auth import check_user_role
from ...models.user import User, UserRole
from ...models.banking import (
    Account, Transaction, Card, TransferBeneficiary,
    AccountType, TransactionType, TransactionStatus, CardType, CardStatus
)
from ...config.settings import get_settings

settings = get_settings()
router = APIRouter()

EXCHANGE_API_BASE_URL = "https://open.er-api.com/v6/latest"
exchange_rates_cache: Dict[str, Dict] = {}
cache_expiry: Dict[str, datetime] = {}
CACHE_DURATION = timedelta(hours=6)

class AccountResponse(BaseModel):
    id: str
    account_number: str
    account_name: str
    account_type: str
    balance: float
    currency: str
    is_primary: bool
    is_active: bool
    created_at: datetime
    last_transaction: Optional[datetime] = None
    credit_limit: Optional[float] = None
    available_credit: Optional[float] = None
    interest_rate: Optional[float] = None
    interest_rate_savings: Optional[float] = None

class AccountCreate(BaseModel):
    account_name: str
    account_type: AccountType
    currency: str = "USD"
    is_primary: bool = False
    initial_balance: float = 0.0

class TransactionResponse(BaseModel):
    id: str
    transaction_id: str
    account_id: str
    transaction_type: str
    amount: float
    currency: str
    description: str
    category: Optional[str] = None
    status: str
    recipient_name: Optional[str] = None
    recipient_account_number: Optional[str] = None
    merchant_name: Optional[str] = None
    merchant_category: Optional[str] = None
    location: Optional[str] = None
    transaction_date: datetime

class TransferCreate(BaseModel):
    from_account_id: str
    to_account_id: Optional[str] = None
    beneficiary_id: Optional[str] = None
    recipient_account_number: Optional[str] = None
    recipient_name: Optional[str] = None
    amount: float
    description: str = ""

    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError('Amount must be greater than zero')
        return v

    @field_validator('to_account_id', 'beneficiary_id', 'recipient_account_number')
    @classmethod
    def validate_transfer_recipient(cls, v: Optional[str], info: Any) -> Optional[str]:
        data = info.data
        if info.field_name == 'recipient_account_number' and not (
                data.get('to_account_id') or data.get('beneficiary_id') or v
        ):
            raise ValueError('Either to_account_id, beneficiary_id, or recipient_account_number must be provided')
        return v

class DepositRequest(BaseModel):
    account_id: str
    amount: float
    description: str = "Deposit"
    category: Optional[str] = None
    merchant_name: Optional[str] = None

    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError('Amount must be greater than zero')
        return v

class WithdrawalRequest(BaseModel):
    account_id: str
    amount: float
    description: str = "Withdrawal"
    category: Optional[str] = None
    merchant_name: Optional[str] = None

    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError('Amount must be greater than zero')
        return v

class CardResponse(BaseModel):
    id: str
    account_id: str
    card_number: str
    card_type: str
    card_name: str
    expiry_date: date
    is_contactless: bool
    daily_limit: float
    status: str
    is_virtual: bool
    purpose: Optional[str] = None

class CardCreate(BaseModel):
    account_id: str
    card_name: str
    card_type: CardType = CardType.DEBIT
    daily_limit: float = 1000.0
    is_contactless: bool = True
    is_virtual: bool = False
    purpose: Optional[str] = None

class BeneficiaryResponse(BaseModel):
    id: str
    beneficiary_name: str
    account_number: str
    bank_name: Optional[str] = None
    bank_code: Optional[str] = None
    is_favorite: bool

class BeneficiaryCreate(BaseModel):
    beneficiary_name: str
    account_number: str
    bank_name: Optional[str] = None
    bank_code: Optional[str] = None
    is_favorite: bool = False

class ConversionRequest(BaseModel):
    from_currency: str
    to_currency: str
    amount: float

    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError('Le montant doit être supérieur à zéro')
        return v

class ConversionResponse(BaseModel):
    from_currency: str
    to_currency: str
    amount: float
    converted_amount: float
    exchange_rate: float
    date: datetime

class CurrencyRatesResponse(BaseModel):
    base_currency: str
    rates: Dict[str, float]
    last_updated: datetime

class TransferWithConversionCreate(BaseModel):
    from_account_id: str
    to_account_id: Optional[str] = None
    beneficiary_id: Optional[str] = None
    recipient_account_number: Optional[str] = None
    recipient_name: Optional[str] = None
    amount: float
    description: str
    convert_currency: bool = False

    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError('Le montant doit être supérieur à zéro')
        return v

    @field_validator('to_account_id', 'beneficiary_id', 'recipient_account_number')
    @classmethod
    def validate_transfer_recipient(cls, v: Optional[str], info: Any) -> Optional[str]:
        data = info.data
        if info.field_name == 'recipient_account_number' and not (
                data.get('to_account_id') or data.get('beneficiary_id') or v
        ):
            raise ValueError('Vous devez fournir soit to_account_id, beneficiary_id, ou recipient_account_number')
        return v

class AccountBalanceUpdate(BaseModel):
    new_balance: float
    @field_validator('new_balance')
    @classmethod
    def validate_balance(cls, v: float) -> float:
        if v < 0:
            raise ValueError('Balance cannot be negative')
        return v

class CardUpdate(BaseModel):
    card_name: Optional[str] = None
    daily_limit: Optional[float] = None
    status: Optional[CardStatus] = None
    is_contactless: Optional[bool] = None

class AccountUpdate(BaseModel):
    account_name: Optional[str] = None
    is_primary: Optional[bool] = None
    is_active: Optional[bool] = None
    preferred_currencies: Optional[List[str]] = None


async def get_user_accounts(user: User) -> List[Account]:
    """Get all accounts for a user"""
    return await Account.find({"user.$id": user.id}).to_list()


async def get_account(account_id: str, user: User) -> Account:
    """Get a specific account for a user and validate ownership"""
    account = await Account.get(account_id)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )

    account_user = await account.user.fetch()
    if account_user.id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    return account

def mask_card_number(card_number: str) -> str:
    """Mask card number except last 4 digits"""
    if not card_number or len(card_number) < 4:
        return card_number
    masked_part = '*' * (len(card_number) - 4)
    return f"{masked_part}{card_number[-4:]}"


async def get_exchange_rates(base_currency: str = "USD") -> Dict:
    """
    Récupère les taux de change pour une devise de base donnée
    Utilise un cache pour limiter les appels API
    """
    now = datetime.now(UTC)

    if (base_currency in exchange_rates_cache and
            base_currency in cache_expiry and
            cache_expiry[base_currency] > now):
        return exchange_rates_cache[base_currency]

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{EXCHANGE_API_BASE_URL}/{base_currency}")
            response.raise_for_status()
            data = response.json()

            if data.get("result") == "success":
                exchange_rates_cache[base_currency] = data
                cache_expiry[base_currency] = now + CACHE_DURATION
                return data
            else:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Erreur lors de la récupération des taux de change"
                )
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Erreur lors de la communication avec l'API de taux de change: {str(e)}"
        )

async def convert_currency(from_currency: str, to_currency: str, amount: float) -> Dict:
    """
    Convertit un montant d'une devise à une autre
    """
    from_currency = from_currency.upper()
    to_currency = to_currency.upper()

    if from_currency == to_currency:
        return {
            "from_currency": from_currency,
            "to_currency": to_currency,
            "amount": amount,
            "converted_amount": amount,
            "exchange_rate": 1.0,
            "date": datetime.now(UTC)
        }

    rates_data = await get_exchange_rates(from_currency)

    if to_currency not in rates_data["rates"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La devise {to_currency} n'est pas prise en charge"
        )

    exchange_rate = rates_data["rates"][to_currency]
    converted_amount = amount * exchange_rate
    return {
        "from_currency": from_currency,
        "to_currency": to_currency,
        "amount": amount,
        "converted_amount": converted_amount,
        "exchange_rate": exchange_rate,
        "date": datetime.fromtimestamp(rates_data["time_last_update_unix"], UTC)
    }

@router.post("/currency/convert", response_model=ConversionResponse)
async def convert_amount(
        conversion_data: ConversionRequest,
        current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
):
    """
    Convertit un montant d'une devise à une autre
    """
    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="L'application bancaire n'est pas activée pour cet utilisateur"
        )
    result = await convert_currency(
        conversion_data.from_currency,
        conversion_data.to_currency,
        conversion_data.amount
    )
    return ConversionResponse(**result)

@router.get("/currency/rates", response_model=CurrencyRatesResponse)
async def get_currency_rates(
        base_currency: str = Query("USD", min_length=3, max_length=3),
        current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
):
    """
    Récupère les taux de change pour une devise de base
    """
    # Vérifier si l'application bancaire est activée pour l'utilisateur
    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="L'application bancaire n'est pas activée pour cet utilisateur"
        )
    rates_data = await get_exchange_rates(base_currency.upper())
    return CurrencyRatesResponse(
        base_currency=base_currency.upper(),
        rates=rates_data["rates"],
        last_updated=datetime.fromtimestamp(rates_data["time_last_update_unix"], UTC)
    )

@router.post("/transfers/currency", response_model=ConversionResponse)
async def calculate_transfer_conversion(
        conversion_data: ConversionRequest,
        current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
):
    """
    Calcule la conversion de devise pour un transfert
    """
    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="L'application bancaire n'est pas activée pour cet utilisateur"
        )
    result = await convert_currency(
        conversion_data.from_currency,
        conversion_data.to_currency,
        conversion_data.amount
    )
    return ConversionResponse(**result)

@router.post("/transfers/with-conversion", response_model=TransactionResponse)
async def create_transfer_with_conversion(
        transfer_data: TransferWithConversionCreate,
        current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
):
    """Créer un transfert entre comptes avec conversion de devise si nécessaire"""
    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="L'application bancaire n'est pas activée pour cet utilisateur"
        )
    from_account = await get_account(transfer_data.from_account_id, current_user)

    if from_account.balance < transfer_data.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Fonds insuffisants"
        )
    to_account = None
    recipient_name = transfer_data.recipient_name
    recipient_account_number = transfer_data.recipient_account_number
    target_currency = from_account.currency

    if transfer_data.to_account_id:
        to_account = await get_account(transfer_data.to_account_id, current_user)
        recipient_name = to_account.account_name
        recipient_account_number = to_account.account_number
        target_currency = to_account.currency

    elif transfer_data.beneficiary_id:
        beneficiary = await TransferBeneficiary.get(transfer_data.beneficiary_id)
        if not beneficiary or beneficiary.user.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bénéficiaire non trouvé"
            )
        recipient_name = beneficiary.beneficiary_name
        recipient_account_number = beneficiary.account_number

    transfer_amount = transfer_data.amount
    converted_amount = transfer_amount
    exchange_rate = 1.0

    if transfer_data.convert_currency and to_account and from_account.currency != to_account.currency:
        conversion_result = await convert_currency(
            from_currency=from_account.currency,
            to_currency=to_account.currency,
            amount=transfer_data.amount
        )
        converted_amount = conversion_result["converted_amount"]
        exchange_rate = conversion_result["exchange_rate"]
    transaction_id = f"TRN{uuid.uuid4().hex[:12].upper()}"
    now = datetime.now(UTC)

    fee_amount = 0
    if not to_account:
        fee_percentage = settings.BANKING_TRANSFER_FEE_PERCENTAGE / 100
        fee_amount = transfer_data.amount * fee_percentage

    conversion_description = ""
    if exchange_rate != 1.0:
        conversion_description = f" (Conversion: {transfer_data.amount} {from_account.currency} → {converted_amount:.2f} {to_account.currency}, taux: {exchange_rate})"
    sender_transaction = Transaction(
        transaction_id=transaction_id,
        account=from_account,
        transaction_type=TransactionType.TRANSFER,
        amount=-transfer_data.amount,
        currency=from_account.currency,
        description=transfer_data.description + conversion_description,
        status=TransactionStatus.COMPLETED,
        recipient_account=to_account,
        recipient_name=recipient_name,
        recipient_account_number=recipient_account_number,
        transaction_date=now
    )
    await sender_transaction.insert()

    from_account.balance -= (transfer_data.amount + fee_amount)
    from_account.last_transaction = now
    await from_account.save()

    if to_account:
        recipient_transaction = Transaction(
            transaction_id=transaction_id,
            account=to_account,
            transaction_type=TransactionType.DEPOSIT,
            amount=converted_amount,
            currency=to_account.currency,
            description=f"Transfert de {from_account.account_name}" +
                        (
                            f" (Converti de {transfer_data.amount} {from_account.currency})" if exchange_rate != 1.0 else ""),
            status=TransactionStatus.COMPLETED,
            transaction_date=now
        )
        await recipient_transaction.insert()
        to_account.balance += converted_amount
        to_account.last_transaction = now
        await to_account.save()
    if fee_amount > 0:
        fee_transaction = Transaction(
            transaction_id=f"FEE{transaction_id[3:]}",
            account=from_account,
            transaction_type=TransactionType.FEE,
            amount=-fee_amount,
            currency=from_account.currency,
            description=f"Frais de transfert ({settings.BANKING_TRANSFER_FEE_PERCENTAGE}%)",
            status=TransactionStatus.COMPLETED,
            transaction_date=now
        )
        await fee_transaction.insert()

    return TransactionResponse(
        id=str(sender_transaction.id),
        transaction_id=sender_transaction.transaction_id,
        account_id=str(from_account.id),
        transaction_type=sender_transaction.transaction_type,
        amount=sender_transaction.amount,
        currency=sender_transaction.currency,
        description=sender_transaction.description,
        category=sender_transaction.category,
        status=sender_transaction.status,
        recipient_name=sender_transaction.recipient_name,
        recipient_account_number=sender_transaction.recipient_account_number,
        merchant_name=sender_transaction.merchant_name,
        merchant_category=sender_transaction.merchant_category,
        location=sender_transaction.location,
        transaction_date=sender_transaction.transaction_date
    )

@router.get("/accounts", response_model=List[AccountResponse])
async def get_accounts(
        current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
):
    """Get all accounts for the current user"""
    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Banking app is not enabled for this user"
        )
    # Debug the query parameters
    print(f"Looking for accounts with user ID: {current_user.id}")

    accounts = await Account.find({"user.$id": current_user.id}).to_list()

    # # If no accounts found, try an alternative approach
    # if not accounts:
    #     # Try using the DBRef format directly
    #     accounts = await Account.find({"user": {"$ref": "users", "$id": current_user.id}}).to_list()
    #
    # # If still no accounts, check if any accounts exist at all (for debugging)
    # if not accounts:
    #     all_accounts = await Account.find_all().to_list()
    #     print(f"Total accounts in database: {len(all_accounts)}")
    #     for acc in all_accounts:
    #         print(f"Account: {acc.id}, User: {acc.user}")

    return [
        AccountResponse(
            id=str(account.id),
            account_number=account.account_number,
            account_name=account.account_name,
            account_type=account.account_type,
            balance=account.balance,
            currency=account.currency,
            is_primary=account.is_primary,
            is_active=account.is_active,
            created_at=account.created_at,
            last_transaction=account.last_transaction,
            credit_limit=account.credit_limit,
            available_credit=account.available_credit,
            interest_rate=account.interest_rate,
            interest_rate_savings=account.interest_rate_savings
        )
        for account in accounts
    ]


@router.get("/accounts/{account_id}", response_model=AccountResponse)
async def get_account_details(
        account_id: str,
        current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
):
    """Get details for a specific account"""
    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Banking app is not enabled for this user"
        )
    account_id = account_id.strip()
    account = await get_account(account_id, current_user)

    return AccountResponse(
        id=str(account.id),
        account_number=account.account_number,
        account_name=account.account_name,
        account_type=account.account_type,
        balance=account.balance,
        currency=account.currency,
        is_primary=account.is_primary,
        is_active=account.is_active,
        created_at=account.created_at,
        last_transaction=account.last_transaction,
        credit_limit=account.credit_limit,
        available_credit=account.available_credit,
        interest_rate=account.interest_rate,
        interest_rate_savings=account.interest_rate_savings
    )

#
# @router.patch("/accounts/{account_id}/balance", response_model=AccountResponse)
# async def update_account_balance(
#         account_id: str,
#         balance_data: AccountBalanceUpdate,
#         current_user: User = Depends(check_user_role([UserRole.ADMIN]))
# ):
#     """Update account balance (admin only)"""
#     account = await Account.get(account_id)
#     if not account:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Account not found"
#         )
#
#     account.balance = balance_data.new_balance
#     account.updated_at = datetime.now(UTC)
#     await account.save()
#
#     return AccountResponse(
#         id=str(account.id),
#         account_number=account.account_number,
#         account_name=account.account_name,
#         account_type=account.account_type,
#         balance=account.balance,
#         currency=account.currency,
#         is_primary=account.is_primary,
#         is_active=account.is_active,
#         created_at=account.created_at,
#         last_transaction=account.last_transaction,
#         credit_limit=account.credit_limit,
#         available_credit=account.available_credit,
#         interest_rate=account.interest_rate,
#         interest_rate_savings=account.interest_rate_savings
#     )


@router.post("/accounts", response_model=AccountResponse)
async def create_account(
        account_data: AccountCreate,
        current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
):
    """Create a new account for the current user"""
    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Banking app is not enabled for this user"
        )
    now = datetime.now(UTC)
    account_number = f"ACC{uuid.uuid4().hex[:12].upper()}"
    credit_limit = None
    available_credit = None
    interest_rate = None
    interest_rate_savings = None

    if account_data.account_type == AccountType.CREDIT:
        credit_limit = 5000.0
        available_credit = credit_limit
        interest_rate = 0.1599
    elif account_data.account_type == AccountType.SAVINGS:
        interest_rate_savings = 0.01

    existing_accounts = await Account.find(Account.user.id == current_user.id).to_list()
    is_primary = len(existing_accounts) == 0 or account_data.is_primary

    if is_primary:
        for existing_account in existing_accounts:
            if existing_account.is_primary:
                existing_account.is_primary = False
                await existing_account.save()

    account = Account(
        user=current_user,
        account_number=account_number,
        account_name=account_data.account_name,
        account_type=account_data.account_type,
        balance=0.0,
        currency=account_data.currency,
        is_primary=is_primary,
        credit_limit=credit_limit,
        available_credit=available_credit,
        interest_rate=interest_rate,
        interest_rate_savings=interest_rate_savings
    )
    await account.insert()

    if account_data.initial_balance > 0:
        transaction_id = f"INIT{uuid.uuid4().hex[:12].upper()}"
        deposit_transaction = Transaction(
            transaction_id=transaction_id,
            account=account,
            transaction_type=TransactionType.DEPOSIT,
            amount=account_data.initial_balance,
            currency=account_data.currency,
            description="Initial deposit",
            status=TransactionStatus.COMPLETED,
            transaction_date=now,
            created_at=now,
            updated_at=now
        )
        await deposit_transaction.insert()
        account.balance += account_data.initial_balance
        account.last_transaction = now
        await account.save()

    return AccountResponse(
        id=str(account.id),
        account_number=account.account_number,
        account_name=account.account_name,
        account_type=account.account_type,
        balance=account.balance,
        currency=account.currency,
        is_primary=account.is_primary,
        is_active=account.is_active,
        created_at=account.created_at,
        last_transaction=account.last_transaction,
        credit_limit=account.credit_limit,
        available_credit=account.available_credit,
        interest_rate=account.interest_rate,
        interest_rate_savings=account.interest_rate_savings
    )


@router.get("/user/accounts/summary", response_model=dict)
async def get_accounts_summary(
        current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
):
    """Get a summary of all user accounts"""
    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Banking app is not enabled for this user"
        )

    accounts = await get_user_accounts(current_user)

    total_balance = 0.0
    currencies = set()
    accounts_by_type = {}

    for account in accounts:
        currencies.add(account.currency)

        # Regrouper par type de compte
        if account.account_type not in accounts_by_type:
            accounts_by_type[account.account_type] = {
                "count": 0,
                "total_balance": 0.0
            }

        accounts_by_type[account.account_type]["count"] += 1
        accounts_by_type[account.account_type]["total_balance"] += account.balance

        total_balance += account.balance

    return {
        "total_accounts": len(accounts),
        "total_balance": total_balance,
        "currencies": list(currencies),
        "accounts_by_type": accounts_by_type,
        "last_updated": datetime.now(UTC)
    }


@router.get("/cards/{card_id}", response_model=CardResponse)
async def get_card_details(
        card_id: str,
        current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
):
    """Get details for a specific card"""
    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Banking app is not enabled for this user"
        )

    card = await Card.get(card_id)
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )

    card_user = await card.user.fetch()
    if card_user.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )

    return CardResponse(
        id=str(card.id),
        account_id=str(card.account.id),
        card_number=mask_card_number(card.card_number),
        card_type=card.card_type,
        card_name=card.card_name,
        expiry_date=card.expiry_date,
        is_contactless=card.is_contactless,
        daily_limit=card.daily_limit,
        status=card.status,
        is_virtual=card.is_virtual,
        purpose=card.purpose
    )


# @router.patch("/cards/{card_id}", response_model=CardResponse)
# async def update_card(
#         card_id: str,
#         card_update: CardUpdate,
#         current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
# ):
#     """Update card details"""
#     if not current_user.uses_banking_app:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Banking app is not enabled for this user"
#         )
#
#     card = await Card.get(card_id)
#     if not card:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Card not found"
#         )
#
#     card_user = await card.user.fetch()
#     if card_user.id != current_user.id:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Card not found"
#         )
#
#     update_data = card_update.dict(exclude_unset=True)
#     for key, value in update_data.items():
#         setattr(card, key, value)
#
#     card.updated_at = datetime.now(UTC)
#     await card.save()
#
#     return CardResponse(
#         id=str(card.id),
#         account_id=str(card.account.id),
#         card_number=mask_card_number(card.card_number),
#         card_type=card.card_type,
#         card_name=card.card_name,
#         expiry_date=card.expiry_date,
#         is_contactless=card.is_contactless,
#         daily_limit=card.daily_limit,
#         status=card.status,
#         is_virtual=card.is_virtual,
#         purpose=card.purpose
#     )
#
#
# @router.delete("/cards/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
# async def delete_card(
#         card_id: str,
#         current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
# ):
#     """Delete a card (set status to inactive)"""
#     if not current_user.uses_banking_app:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Banking app is not enabled for this user"
#         )
#
#     card = await Card.get(card_id)
#     if not card:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Card not found"
#         )
#
#     card_user = await card.user.fetch()
#     if card_user.id != current_user.id:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Card not found"
#         )
#
#     card.status = CardStatus.INACTIVE
#     card.updated_at = datetime.now(UTC)
#     await card.save()
#
#     return None
#
#
# @router.patch("/accounts/{account_id}", response_model=AccountResponse)
# async def update_account(
#         account_id: str,
#         account_update: AccountUpdate,
#         current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
# ):
#     """Update account details"""
#     if not current_user.uses_banking_app:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Banking app is not enabled for this user"
#         )
#
#     account = await get_account(account_id, current_user)
#
#     update_data = account_update.dict(exclude_unset=True)
#
#     if update_data.get("is_primary", False):
#         user_accounts = await get_user_accounts(current_user)
#         for other_account in user_accounts:
#             if str(other_account.id) != account_id and other_account.is_primary:
#                 other_account.is_primary = False
#                 await other_account.save()
#
#     for key, value in update_data.items():
#         setattr(account, key, value)
#
#     account.updated_at = datetime.now(UTC)
#     await account.save()
#
#     return AccountResponse(
#         id=str(account.id),
#         account_number=account.account_number,
#         account_name=account.account_name,
#         account_type=account.account_type,
#         balance=account.balance,
#         currency=account.currency,
#         is_primary=account.is_primary,
#         is_active=account.is_active,
#         created_at=account.created_at,
#         last_transaction=account.last_transaction,
#         credit_limit=account.credit_limit,
#         available_credit=account.available_credit,
#         interest_rate=account.interest_rate,
#         interest_rate_savings=account.interest_rate_savings
#     )


@router.get("/accounts/primary", response_model=AccountResponse)
async def get_primary_account(
        current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
):
    """Get the user's primary account"""
    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Banking app is not enabled for this user"
        )
    primary_account = await Account.find_one(
        {"user.id": str(current_user.id), "is_primary": True}
    )


    if not primary_account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No primary account found"
        )

    return AccountResponse(
        id=str(primary_account.id),
        account_number=primary_account.account_number,
        account_name=primary_account.account_name,
        account_type=primary_account.account_type,
        balance=primary_account.balance,
        currency=primary_account.currency,
        is_primary=primary_account.is_primary,
        is_active=primary_account.is_active,
        created_at=primary_account.created_at,
        last_transaction=primary_account.last_transaction,
        credit_limit=primary_account.credit_limit,
        available_credit=primary_account.available_credit,
        interest_rate=primary_account.interest_rate,
        interest_rate_savings=primary_account.interest_rate_savings
    )


@router.get("/user/recent-activity", response_model=dict)
async def get_recent_activity(
        days: int = Query(7, gt=0, le=30),
        current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
):
    """Get a summary of recent account activity"""
    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Banking app is not enabled for this user"
        )

    from ...models.banking import Transaction
    from datetime import timedelta

    start_date = datetime.now(UTC) - timedelta(days=days)

    accounts = await get_user_accounts(current_user)
    account_ids = [str(account.id) for account in accounts]

    if not account_ids:
        return {
            "transactions_count": 0,
            "total_inflow": 0,
            "total_outflow": 0,
            "by_category": {},
            "by_type": {},
            "period_days": days
        }

    transactions = await Transaction.find({
        "account.id": {"$in": account_ids},
        "transaction_date": {"$gte": start_date}
    }).to_list()

    total_inflow = 0
    total_outflow = 0
    by_category = {}
    by_type = {}

    for transaction in transactions:
        if transaction.amount > 0:
            total_inflow += transaction.amount
        else:
            total_outflow += abs(transaction.amount)

        if transaction.category:
            if transaction.category not in by_category:
                by_category[transaction.category] = 0
            by_category[transaction.category] += abs(transaction.amount)

        if transaction.transaction_type not in by_type:
            by_type[transaction.transaction_type] = 0
        by_type[transaction.transaction_type] += abs(transaction.amount)

    return {
        "transactions_count": len(transactions),
        "total_inflow": total_inflow,
        "total_outflow": total_outflow,
        "by_category": by_category,
        "by_type": by_type,
        "period_days": days
    }


@router.get("/user/banking-profile", response_model=dict)
async def get_banking_profile(
        current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
):
    """Get banking profile information including accounts and cards"""
    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Banking app is not enabled for this user"
        )

    accounts = await get_user_accounts(current_user)
    accounts_response = []

    for account in accounts:
        accounts_response.append({
            "id": str(account.id),
            "account_number": account.account_number,
            "account_name": account.account_name,
            "account_type": account.account_type,
            "balance": account.balance,
            "currency": account.currency,
            "is_primary": account.is_primary
        })

    cards = await Card.find({"user.id": current_user.id}).to_list()
    cards_response = []

    for card in cards:
        account = await card.account.fetch()
        cards_response.append({
            "id": str(card.id),
            "card_name": card.card_name,
            "card_number": mask_card_number(card.card_number),
            "card_type": card.card_type,
            "status": card.status,
            "expiry_date": card.expiry_date.isoformat(),
            "account_name": account.account_name,
            "account_id": str(account.id)
        })
    total_balance = sum(account.balance for account in accounts)

    active_accounts = sum(1 for account in accounts if account.is_active)
    active_cards = sum(1 for card in cards if card.status == CardStatus.ACTIVE)

    return {
        "user_id": str(current_user.id),
        "username": current_user.username,
        "email": current_user.email,
        "total_balance": total_balance,
        "accounts_count": len(accounts),
        "active_accounts": active_accounts,
        "cards_count": len(cards),
        "active_cards": active_cards,
        "accounts": accounts_response,
        "cards": cards_response
    }


@router.post("/deposit", response_model=TransactionResponse)
async def deposit_money(
        deposit_data: DepositRequest,
        current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
):
    """Deposit money into an account"""
    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Banking app is not enabled for this user"
        )

    account = await get_account(deposit_data.account_id, current_user)

    transaction_id = f"DEP{uuid.uuid4().hex[:12].upper()}"
    now = datetime.now(UTC)

    transaction = Transaction(
        transaction_id=transaction_id,
        account=account,
        transaction_type=TransactionType.DEPOSIT,
        amount=deposit_data.amount,
        currency=account.currency,
        description=deposit_data.description,
        category=deposit_data.category,
        merchant_name=deposit_data.merchant_name,
        status=TransactionStatus.COMPLETED,
        transaction_date=now
    )

    await transaction.insert()

    account.balance += deposit_data.amount
    account.last_transaction = now
    await account.save()

    return TransactionResponse(
        id=str(transaction.id),
        transaction_id=transaction.transaction_id,
        account_id=str(account.id),
        transaction_type=transaction.transaction_type,
        amount=transaction.amount,
        currency=transaction.currency,
        description=transaction.description,
        category=transaction.category,
        status=transaction.status,
        recipient_name=transaction.recipient_name,
        recipient_account_number=transaction.recipient_account_number,
        merchant_name=transaction.merchant_name,
        merchant_category=transaction.merchant_category,
        location=transaction.location,
        transaction_date=transaction.transaction_date
    )


@router.post("/withdrawal", response_model=TransactionResponse)
async def withdraw_money(
        withdrawal_data: WithdrawalRequest,
        current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
):
    """Withdraw money from an account"""
    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Banking app is not enabled for this user"
        )

    account = await get_account(withdrawal_data.account_id, current_user)

    if account.balance < withdrawal_data.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient funds"
        )

    transaction_id = f"WIT{uuid.uuid4().hex[:12].upper()}"
    now = datetime.now(UTC)

    transaction = Transaction(
        transaction_id=transaction_id,
        account=account,
        transaction_type=TransactionType.WITHDRAWAL,
        amount=-withdrawal_data.amount,
        currency=account.currency,
        description=withdrawal_data.description,
        category=withdrawal_data.category,
        merchant_name=withdrawal_data.merchant_name,
        status=TransactionStatus.COMPLETED,
        transaction_date=now
    )

    await transaction.insert()

    account.balance -= withdrawal_data.amount
    account.last_transaction = now
    await account.save()

    return TransactionResponse(
        id=str(transaction.id),
        transaction_id=transaction.transaction_id,
        account_id=str(account.id),
        transaction_type=transaction.transaction_type,
        amount=transaction.amount,
        currency=transaction.currency,
        description=transaction.description,
        category=transaction.category,
        status=transaction.status,
        recipient_name=transaction.recipient_name,
        recipient_account_number=transaction.recipient_account_number,
        merchant_name=transaction.merchant_name,
        merchant_category=transaction.merchant_category,
        location=transaction.location,
        transaction_date=transaction.transaction_date
    )


@router.get("/transactions", response_model=List[TransactionResponse])
async def get_transactions(
        account_id: Optional[str] = None,
        transaction_type: Optional[TransactionType] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = Query(20, gt=0, le=100),
        offset: int = Query(0, ge=0),
        current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
):
    """Get transactions for the current user"""

    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Banking app is not enabled for this user"
        )

    accounts = await get_user_accounts(current_user)
    account_ids = [str(account.id) for account in accounts]

    if not account_ids:
        return []

    query: Dict[str, Any]= {}

    if account_id:
        if account_id not in account_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account does not belong to this user"
            )
        query["account.id"] = account_id
    else:
        query["account.id"] = {"$in": account_ids}

    if transaction_type:
        query["transaction_type"] = transaction_type

    date_filter = {}
    if start_date:
        date_filter["$gte"] = start_date
    if end_date:
        date_filter["$lte"] = end_date
    if date_filter:
        query["transaction_date"] = date_filter

    sort_expression: List[Tuple[str, int]] = [("transaction_date", -1)]  # Sort by date descending
    transactions = await Transaction.find(query).sort(sort_expression).skip(offset).limit(limit).to_list()

    transactions_response = []
    for transaction in transactions:
        account = await transaction.account.fetch()
        recipient_account = None
        if transaction.recipient_account:
            recipient_account = await transaction.recipient_account.fetch()

        transactions_response.append(TransactionResponse(
            id=str(transaction.id),
            transaction_id=transaction.transaction_id,
            account_id=str(transaction.account.id),
            transaction_type=transaction.transaction_type,
            amount=transaction.amount,
            currency=transaction.currency,
            description=transaction.description,
            category=transaction.category,
            status=transaction.status,
            recipient_name=transaction.recipient_name or (
                recipient_account.account_name if recipient_account else None),
            recipient_account_number=transaction.recipient_account_number or (
                recipient_account.account_number if recipient_account else None),
            merchant_name=transaction.merchant_name,
            merchant_category=transaction.merchant_category,
            location=transaction.location,
            transaction_date=transaction.transaction_date
        ))

    return transactions_response


@router.post("/transfers", response_model=TransactionResponse)
async def create_transfer(
        transfer_data: TransferCreate,
        current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
):
    """Create a transfer between accounts"""
    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Banking app is not enabled for this user"
        )

    from_account = await get_account(transfer_data.from_account_id, current_user)

    if from_account.balance < transfer_data.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient funds"
        )

    to_account = None
    recipient_name = transfer_data.recipient_name
    recipient_account_number = transfer_data.recipient_account_number

    if transfer_data.to_account_id:
        to_account = await get_account(transfer_data.to_account_id, current_user)
        recipient_name = to_account.account_name
        recipient_account_number = to_account.account_number

    elif transfer_data.beneficiary_id:
        beneficiary = await TransferBeneficiary.get(transfer_data.beneficiary_id)
        if not beneficiary or beneficiary.user.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Beneficiary not found"
            )
        recipient_name = beneficiary.beneficiary_name
        recipient_account_number = beneficiary.account_number

    transaction_id = f"TRN{uuid.uuid4().hex[:12].upper()}"
    now = datetime.now(UTC)

    fee_amount = 0
    if not to_account:  # External transfer
        fee_percentage = settings.BANKING_TRANSFER_FEE_PERCENTAGE / 100
        fee_amount = transfer_data.amount * fee_percentage

    sender_transaction = Transaction(
        transaction_id=transaction_id,
        account=from_account,
        transaction_type=TransactionType.TRANSFER,
        amount=-transfer_data.amount,
        currency=from_account.currency,
        description=transfer_data.description,
        status=TransactionStatus.COMPLETED,
        recipient_account=to_account,
        recipient_name=recipient_name,
        recipient_account_number=recipient_account_number,
        transaction_date=now
    )
    await sender_transaction.insert()

    from_account.balance -= (transfer_data.amount + fee_amount)
    from_account.last_transaction = now
    await from_account.save()

    if to_account:
        recipient_transaction = Transaction(
            transaction_id=transaction_id,
            account=to_account,
            transaction_type=TransactionType.DEPOSIT,
            amount=transfer_data.amount,
            currency=to_account.currency,
            description=f"Transfer from {from_account.account_name}",
            status=TransactionStatus.COMPLETED,
            transaction_date=now
        )

        await recipient_transaction.insert()

        to_account.balance += transfer_data.amount
        to_account.last_transaction = now
        await to_account.save()

    if fee_amount > 0:
        fee_transaction = Transaction(
            transaction_id=f"FEE{transaction_id[3:]}",
            account=from_account,
            transaction_type=TransactionType.FEE,
            amount=-fee_amount,
            currency=from_account.currency,
            description=f"Transfer fee ({settings.BANKING_TRANSFER_FEE_PERCENTAGE}%)",
            status=TransactionStatus.COMPLETED,
            transaction_date=now
        )

        await fee_transaction.insert()

    # Create response
    return TransactionResponse(
        id=str(sender_transaction.id),
        transaction_id=sender_transaction.transaction_id,
        account_id=str(from_account.id),
        transaction_type=sender_transaction.transaction_type,
        amount=sender_transaction.amount,
        currency=sender_transaction.currency,
        description=sender_transaction.description,
        category=sender_transaction.category,
        status=sender_transaction.status,
        recipient_name=sender_transaction.recipient_name,
        recipient_account_number=sender_transaction.recipient_account_number,
        merchant_name=sender_transaction.merchant_name,
        merchant_category=sender_transaction.merchant_category,
        location=sender_transaction.location,
        transaction_date=sender_transaction.transaction_date
    )


@router.get("/cards", response_model=List[CardResponse])
async def get_cards(
        current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
):
    """Get cards for the current user"""
    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Banking app is not enabled for this user"
        )
    accounts = await get_user_accounts(current_user)
    if not accounts:
        return []

    account_ids = [account.id for account in accounts]

    # Debug the query parameters
    print(f"Looking for cards with account IDs: {account_ids}")

    cards = await Card.find({"account.$id": {"$in": account_ids}}).to_list()

    if not cards:
        string_account_ids = [str(account_id) for account_id in account_ids]
        cards = await Card.find({"account.$id": {"$in": string_account_ids}}).to_list()

    if not cards:
        query_conditions = [{"account": {"$ref": "accounts", "$id": account_id}} for account_id in account_ids]
        if query_conditions:
            cards = await Card.find({"$or": query_conditions}).to_list()

    cards_response = [
        CardResponse(
            id=str(card.id),
            # Extract the account ID correctly from the link object
            account_id=str(card.account.id) if hasattr(card.account, 'id') else (
                str(card.account) if isinstance(card.account, (str, uuid.UUID)) else str(card.account.to_ref().id)
            ),
            card_number=mask_card_number(card.card_number),
            card_type=card.card_type,
            card_name=card.card_name,
            expiry_date=card.expiry_date,
            is_contactless=card.is_contactless,
            daily_limit=card.daily_limit,
            status=card.status,
            is_virtual=card.is_virtual,
            purpose=card.purpose
        )
        for card in cards
    ]
    return cards_response


@router.get("/accounts/{account_id}/cards", response_model=List[CardResponse])
async def get_account_cards(
        account_id: str,
        current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
):
    """Get cards for a specific account of the current user"""
    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Banking app is not enabled for this user"
        )
    account = await get_account(account_id, current_user)

    print(f"Looking for cards with account ID: {account.id}")

    cards = await Card.find({"account.$id": account.id}).to_list()

    if not cards:
        print(f"Trying alternative query with string account ID: {str(account.id)}")
        cards = await Card.find({"account.$id": str(account.id)}).to_list()

    if not cards:
        print("Trying with full DBRef format")
        cards = await Card.find({"account": {"$ref": "accounts", "$id": account.id}}).to_list()

    if not cards:
        all_cards = await Card.find_all().limit(5).to_list()
        print(f"Sample of cards in database: {len(all_cards)}")
        for card in all_cards:
            print(f"Card: {card.id}, Account: {card.account}")

    cards_response = [
        CardResponse(
            id=str(card.id),
            # Extract the account ID correctly from the link object
            account_id=str(card.account.id) if hasattr(card.account, 'id') else (
                str(card.account) if isinstance(card.account, (str, uuid.UUID)) else str(card.account.to_ref().id)
            ),
            card_number=mask_card_number(card.card_number),
            card_type=card.card_type,
            card_name=card.card_name,
            expiry_date=card.expiry_date,
            is_contactless=card.is_contactless,
            daily_limit=card.daily_limit,
            status=card.status,
            is_virtual=card.is_virtual,
            purpose=card.purpose
        )
        for card in cards
    ]
    return cards_response


@router.post("/cards", response_model=CardResponse)
async def create_card(
        card_data: CardCreate,
        current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
):
    """Create a new card for an account"""

    # Check if banking app is enabled for user
    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Banking app is not enabled for this user"
        )
    account = await get_account(card_data.account_id, current_user)

    card_number = f"4{''.join(str(uuid.uuid4().int)[:15])}"

    today = date.today()
    expiry_date = date(today.year + 3, today.month, 1)
    cvv = f"{uuid.uuid4().int % 1000:03d}"

    card = Card(
        user=current_user,
        account=account,
        card_number=card_number,
        card_type=card_data.card_type,
        card_name=card_data.card_name,
        expiry_date=expiry_date,
        cvv=cvv,
        is_contactless=card_data.is_contactless,
        daily_limit=card_data.daily_limit,
        is_virtual=card_data.is_virtual,
        purpose=card_data.purpose
    )

    await card.insert()

    return CardResponse(
        id=str(card.id),
        account_id=str(card.account.id),
        card_number=mask_card_number(card.card_number),
        card_type=card.card_type,
        card_name=card.card_name,
        expiry_date=card.expiry_date,
        is_contactless=card.is_contactless,
        daily_limit=card.daily_limit,
        status=card.status,
        is_virtual=card.is_virtual,
        purpose=card.purpose
    )

# @router.get("/beneficiaries", response_model=List[BeneficiaryResponse])
# async def get_beneficiaries(
#         current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
# ):
#     """Get saved beneficiaries for transfers"""
#     if not current_user.uses_banking_app:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Banking app is not enabled for this user"
#         )
#     beneficiaries = await TransferBeneficiary.find(TransferBeneficiary.user.id == current_user.id).to_list()
#
#     return [
#         BeneficiaryResponse(
#             id=str(beneficiary.id),
#             beneficiary_name=beneficiary.beneficiary_name,
#             account_number=beneficiary.account_number,
#             bank_name=beneficiary.bank_name,
#             bank_code=beneficiary.bank_code,
#             is_favorite=beneficiary.is_favorite
#         )
#         for beneficiary in beneficiaries
#     ]
# @router.post("/beneficiaries", response_model=BeneficiaryResponse)
# async def create_beneficiary(
#         beneficiary_data: BeneficiaryCreate,
#         current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
# ):
#     """Create a new beneficiary for transfers"""
#     if not current_user.uses_banking_app:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Banking app is not enabled for this user"
#         )
#
#     existing = await TransferBeneficiary.find_one({
#         "user.id": current_user.id,
#         "account_number": beneficiary_data.account_number
#     })
#
#     if existing:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Beneficiary with this account number already exists"
#         )
#
#     beneficiary = TransferBeneficiary(
#         user=current_user,
#         beneficiary_name=beneficiary_data.beneficiary_name,
#         account_number=beneficiary_data.account_number,
#         bank_name=beneficiary_data.bank_name,
#         bank_code=beneficiary_data.bank_code,
#         is_favorite=beneficiary_data.is_favorite
#     )
#     await beneficiary.insert()
#     return BeneficiaryResponse(
#         id=str(beneficiary.id),
#         beneficiary_name=beneficiary.beneficiary_name,
#         account_number=beneficiary.account_number,
#         bank_name=beneficiary.bank_name,
#         bank_code=beneficiary.bank_code,
#         is_favorite=beneficiary.is_favorite
#     )