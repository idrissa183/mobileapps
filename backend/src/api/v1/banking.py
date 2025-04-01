from datetime import datetime, date, UTC
from typing import List, Optional, Any, Dict, Tuple
import uuid

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


# Schema models for request and response
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

    # Account type specific fields
    credit_limit: Optional[float] = None
    available_credit: Optional[float] = None
    interest_rate: Optional[float] = None
    interest_rate_savings: Optional[float] = None


class AccountCreate(BaseModel):
    account_name: str
    account_type: AccountType
    currency: str = "USD"
    is_primary: bool = False


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
    description: str

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


# Helper functions
async def get_user_accounts(user: User) -> List[Account]:
    """Get all accounts for a user"""
    return await Account.find(Account.user.id == str(user.id)).to_list()


async def get_account(account_id: str, user: User) -> Account:
    """Get a specific account for a user and validate ownership"""
    account = await Account.get(account_id)
    if not account or account.user.id != user.id:
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


# Routes
@router.get("/accounts", response_model=List[AccountResponse])
async def get_accounts(
        account_type: Optional[AccountType] = None,
        is_active: Optional[bool] = None,
        current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
):
    """Get all accounts for the current user"""

    # Check if banking app is enabled for user
    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Banking app is not enabled for this user"
        )

    # Build query
    query = {"user.id": current_user.id}
    if account_type:
        query["account_type"] = account_type
    if is_active is not None:
        query["is_active"] = is_active

    # Get accounts
    accounts = await Account.find(query).to_list()

    # Create response
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


@router.post("/accounts", response_model=AccountResponse)
async def create_account(
        account_data: AccountCreate,
        current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
):
    """Create a new account for the current user"""

    # Check if banking app is enabled for user
    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Banking app is not enabled for this user"
        )

    # Generate account number
    account_number = f"ACC{uuid.uuid4().hex[:12].upper()}"

    # Set up account properties based on type
    credit_limit = None
    available_credit = None
    interest_rate = None
    interest_rate_savings = None

    if account_data.account_type == AccountType.CREDIT:
        credit_limit = 5000.0  # Default credit limit
        available_credit = credit_limit
        interest_rate = 0.1599  # 15.99% APR
    elif account_data.account_type == AccountType.SAVINGS:
        interest_rate_savings = 0.01  # 1% interest rate

    # Check if this would be the first account for the user
    existing_accounts = await Account.find(Account.user.id == current_user.id).to_list()
    is_primary = len(existing_accounts) == 0 or account_data.is_primary

    # If this account is set as primary, update other accounts
    if is_primary:
        for existing_account in existing_accounts:
            if existing_account.is_primary:
                existing_account.is_primary = False
                await existing_account.save()

    # Create account
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

    # Create response
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

    # Check if banking app is enabled for user
    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Banking app is not enabled for this user"
        )

    # Get accounts for user
    accounts = await get_user_accounts(current_user)
    account_ids = [str(account.id) for account in accounts]

    if not account_ids:
        return []

    # Build query
    query: Dict[str, Any]= {}

    # Filter by account if provided
    if account_id:
        if account_id not in account_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account does not belong to this user"
            )
        query["account.id"] = account_id
    else:
        query["account.id"] = {"$in": account_ids}

    # Filter by transaction type if provided
    if transaction_type:
        query["transaction_type"] = transaction_type

    # Filter by date range if provided
    date_filter = {}
    if start_date:
        date_filter["$gte"] = start_date
    if end_date:
        date_filter["$lte"] = end_date
    if date_filter:
        query["transaction_date"] = date_filter

    # Get transactions
    sort_expression: List[Tuple[str, int]] = [("transaction_date", -1)]  # Sort by date descending
    transactions = await Transaction.find(query).sort(sort_expression).skip(offset).limit(limit).to_list()

    # Create response
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

    # Check if banking app is enabled for user
    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Banking app is not enabled for this user"
        )

    # Get source account
    from_account = await get_account(transfer_data.from_account_id, current_user)

    # Check if source account has sufficient funds
    if from_account.balance < transfer_data.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient funds"
        )

    # Determine recipient account
    to_account = None
    recipient_name = transfer_data.recipient_name
    recipient_account_number = transfer_data.recipient_account_number

    # If transferring to an account the user owns
    if transfer_data.to_account_id:
        to_account = await get_account(transfer_data.to_account_id, current_user)
        recipient_name = to_account.account_name
        recipient_account_number = to_account.account_number

    # If transferring to a saved beneficiary
    elif transfer_data.beneficiary_id:
        beneficiary = await TransferBeneficiary.get(transfer_data.beneficiary_id)
        if not beneficiary or beneficiary.user.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Beneficiary not found"
            )
        recipient_name = beneficiary.beneficiary_name
        recipient_account_number = beneficiary.account_number

    # Generate transaction ID
    transaction_id = f"TRN{uuid.uuid4().hex[:12].upper()}"
    now = datetime.now(UTC)

    # Calculate fees (if applicable)
    fee_amount = 0
    if not to_account:  # External transfer
        fee_percentage = settings.BANKING_TRANSFER_FEE_PERCENTAGE / 100
        fee_amount = transfer_data.amount * fee_percentage

    # Create transaction for sender
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

    # Update sender's account balance
    from_account.balance -= (transfer_data.amount + fee_amount)
    from_account.last_transaction = now
    await from_account.save()

    # If transfer is to another account the user owns, create a deposit transaction
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

        # Update recipient's account balance
        to_account.balance += transfer_data.amount
        to_account.last_transaction = now
        await to_account.save()

    # If there's a fee, create a fee transaction
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
        account_id: Optional[str] = None,
        card_type: Optional[CardType] = None,
        card_status: Optional[CardStatus] = None,
        current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
):
    """Get cards for the current user"""

    # Check if banking app is enabled for user
    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Banking app is not enabled for this user"
        )

    # Get accounts for user
    accounts = await get_user_accounts(current_user)
    account_ids = [str(account.id) for account in accounts]

    if not account_ids:
        return []

    # Build query
    query: Dict[str, Any] = {}

    # Filter by account if provided
    if account_id:
        if account_id not in account_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account does not belong to this user"
            )
        query["account.id"] = account_id
    else:
        query["account.id"] = {"$in": account_ids}

    # Filter by card type if provided
    if card_type:
        query["card_type"] = card_type

    # Filter by status if provided
    if card_status:
        query["status"] = card_status

    # Get cards
    cards = await Card.find(query).to_list()

    # Create response
    cards_response = []
    for card in cards:
        cards_response.append(CardResponse(
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
        ))

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

    # Get account
    account = await get_account(card_data.account_id, current_user)

    # Generate card details
    card_number = f"4{''.join(str(uuid.uuid4().int)[:15])}"  # 16-digit card number starting with 4

    # Set expiry date (3 years from now)
    today = date.today()
    expiry_date = date(today.year + 3, today.month, 1)

    # Generate CVV
    cvv = f"{uuid.uuid4().int % 1000:03d}"  # 3-digit CVV

    # Create card
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

    # Create response
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


@router.get("/beneficiaries", response_model=List[BeneficiaryResponse])
async def get_beneficiaries(
        current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
):
    """Get saved beneficiaries for transfers"""

    # Check if banking app is enabled for user
    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Banking app is not enabled for this user"
        )

    # Get beneficiaries
    beneficiaries = await TransferBeneficiary.find(TransferBeneficiary.user.id == current_user.id).to_list()

    # Create response
    return [
        BeneficiaryResponse(
            id=str(beneficiary.id),
            beneficiary_name=beneficiary.beneficiary_name,
            account_number=beneficiary.account_number,
            bank_name=beneficiary.bank_name,
            bank_code=beneficiary.bank_code,
            is_favorite=beneficiary.is_favorite
        )
        for beneficiary in beneficiaries
    ]


@router.post("/beneficiaries", response_model=BeneficiaryResponse)
async def create_beneficiary(
        beneficiary_data: BeneficiaryCreate,
        current_user: User = Depends(check_user_role([UserRole.BANKING_USER]))
):
    """Create a new beneficiary for transfers"""

    # Check if banking app is enabled for user
    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Banking app is not enabled for this user"
        )

    # Check if beneficiary already exists
    existing = await TransferBeneficiary.find_one({
        "user.id": current_user.id,
        "account_number": beneficiary_data.account_number
    })

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Beneficiary with this account number already exists"
        )

    # Create beneficiary
    beneficiary = TransferBeneficiary(
        user=current_user,
        beneficiary_name=beneficiary_data.beneficiary_name,
        account_number=beneficiary_data.account_number,
        bank_name=beneficiary_data.bank_name,
        bank_code=beneficiary_data.bank_code,
        is_favorite=beneficiary_data.is_favorite
    )

    await beneficiary.insert()

    # Create response
    return BeneficiaryResponse(
        id=str(beneficiary.id),
        beneficiary_name=beneficiary.beneficiary_name,
        account_number=beneficiary.account_number,
        bank_name=beneficiary.bank_name,
        bank_code=beneficiary.bank_code,
        is_favorite=beneficiary.is_favorite
    )