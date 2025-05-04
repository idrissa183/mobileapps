import asyncio
import logging
import uuid
from datetime import datetime, UTC
from typing import List, Optional, Tuple
from decimal import Decimal, getcontext

import httpx
from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, Query, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, field_validator
from src.api.v1.auth import get_current_active_user
from src.models.user import User
from src.models.banking import Account, Transaction, TransactionType, TransactionStatus, Currency, ExchangeRate

logger = logging.getLogger(__name__)
router = APIRouter()
getcontext().prec = 6

class TransactionResponse(BaseModel):
    id: PydanticObjectId
    transaction_id: str
    account_id: str
    transaction_type: str
    amount: float
    currency: str
    description: str
    status: str
    recipient_name: Optional[str] = None
    recipient_account_number: Optional[str] = None
    transaction_date: datetime

class DepositRequest(BaseModel):
    amount: float
    description: str = "Deposit"

    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError('Amount must be greater than zero')
        return v

class WithdrawalRequest(BaseModel):
    amount: float
    description: str = "Withdrawal"

    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError('Amount must be greater than zero')
        return v

class TransferCreate(BaseModel):
    to_account_number: str
    amount: float
    description: str = ""

    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError('Amount must be greater than zero')
        return v


class ConversionRequest(BaseModel):
    from_currency: str
    to_currency: str
    amount: float

    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError('Amount must be greater than zero')
        return v

class ConversionResponse(BaseModel):
    from_currency: str
    to_currency: str
    amount: float
    converted_amount: float
    exchange_rate: float
    date: datetime


async def get_user_account(user: User) -> Account:
    """Récupère le compte bancaire unique d'un utilisateur"""
    if not user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Banking app is not enabled for this user"
        )

    account = await Account.find_one({"user.$id": user.id})
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found for this user"
        )

    return account


async def get_account_by_number(account_number: str) -> Account:
    """Récupère un compte bancaire par son numéro de compte"""
    account = await Account.find_one({"account_number": account_number})
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient account not found"
        )
    return account


async def get_exchange_rate(from_currency: Currency, to_currency: Currency) -> Decimal:
    """Récupère le taux de change entre deux devises"""
    if from_currency == to_currency:
        return Decimal(1)

    rates = await ExchangeRate.find_one({})
    if not rates:
        # Si les taux n'existent pas, essayons de les récupérer d'abord
        await update_exchange_rates()

        # Réessayons de récupérer les taux
        rates = await ExchangeRate.find_one({})
        if not rates:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Exchange rates not available"
            )

    if to_currency.value not in rates.rates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Conversion from {from_currency} to {to_currency} not supported"
        )

    return Decimal(str(rates.rates[to_currency.value]))


async def update_exchange_rates():
    """Met à jour les taux de change depuis une API externe"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("https://api.exchangerate-api.com/v4/latest/USD")
            data = response.json()

            await ExchangeRate.find_one().upsert(
                {"$set": {
                    "rates": data["rates"],
                    "last_updated": datetime.now(UTC)
                }},
                on_insert=ExchangeRate(
                    base_currency=Currency.USD,
                    rates=data["rates"],
                    last_updated=datetime.now(UTC)
                )
            )
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour des taux: {str(e)}")


@router.get("/transactions", response_model=List[TransactionResponse])
async def get_transactions(
        transaction_type: Optional[TransactionType] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = Query(20, gt=0, le=100),
        offset: int = Query(0, ge=0),
        current_user: User = Depends(get_current_active_user)
):
    """Get transactions for the current user"""
    account = await get_user_account(current_user)

    # Modified query to work with DBRef format
    query = {"account.$id": account.id}

    if transaction_type:
        query["transaction_type"] = transaction_type

    date_filter = {}
    if start_date:
        date_filter["$gte"] = start_date
    if end_date:
        date_filter["$lte"] = end_date
    if date_filter:
        query["transaction_date"] = date_filter

    if end_date and start_date and end_date < start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La date de fin doit être postérieure à la date de début"
        )

    # Debug: Print the query being used
    print(f"Transaction query: {query}")

    sort_expression: List[Tuple[str, int]] = [("transaction_date", -1)]
    transactions = await Transaction.find(query).sort(sort_expression).skip(offset).limit(limit).to_list()

    # Debug: Print number of transactions found
    print(f"Found {len(transactions)} transactions")


    transactions_response = []
    for transaction in transactions:
        transaction_account = await transaction.account.fetch()
        response_data = {
            "id": transaction.id,
            "transaction_id": transaction.transaction_id,
            "account_id": str(transaction_account.id),
            "transaction_type": transaction.transaction_type,
            "amount": transaction.amount,
            "currency": transaction.currency,
            "description": transaction.description,
            "status": transaction.status,
            "transaction_date": transaction.transaction_date
        }

        if transaction.recipient_name:
            response_data["recipient_name"] = transaction.recipient_name
        if transaction.recipient_account_number:
            response_data["recipient_account_number"] = transaction.recipient_account_number

        transactions_response.append(TransactionResponse(**response_data))

    return transactions_response



@router.post("/transactions/deposit", response_model=TransactionResponse)
async def deposit_money(
        deposit_data: DepositRequest,
        current_user: User = Depends(get_current_active_user)
):
    """Deposit money into an account"""
    account: Account = await get_user_account(current_user)

    transaction_id = f"DEP{uuid.uuid4().hex[:12].upper()}"
    now = datetime.now(UTC)

    transaction = Transaction(
        transaction_id=transaction_id,
        account=account,
        transaction_type=TransactionType.DEPOSIT,
        amount=deposit_data.amount,
        currency=account.currency,
        description=deposit_data.description,
        status=TransactionStatus.COMPLETED,
        transaction_date=now
    )

    await transaction.insert()

    # Mise à jour du solde
    account.balance += deposit_data.amount
    account.last_transaction = now
    account.updated_at = now
    await account.save()

    return TransactionResponse(
        id=transaction.id,
        transaction_id=transaction.transaction_id,
        account_id=str(account.id),
        transaction_type=transaction.transaction_type,
        amount=transaction.amount,
        currency=transaction.currency,
        description=transaction.description,
        status=transaction.status,
        transaction_date=transaction.transaction_date
    )


@router.post("/transactions/withdrawal", response_model=TransactionResponse)
async def withdraw_money(
        withdrawal_data: WithdrawalRequest,
        current_user: User = Depends(get_current_active_user)
):
    """Withdraw money from an account"""
    account: Account = await get_user_account(current_user)
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
        amount=-withdrawal_data.amount,  # Montant négatif pour un retrait
        currency=account.currency,
        description=withdrawal_data.description,
        status=TransactionStatus.COMPLETED,
        transaction_date=now
    )

    await transaction.insert()

    # Mise à jour du solde
    account.balance -= withdrawal_data.amount
    account.last_transaction = now
    account.updated_at = now
    await account.save()

    return TransactionResponse(
        id=transaction.id,
        transaction_id=transaction.transaction_id,
        account_id=str(account.id),
        transaction_type=transaction.transaction_type,
        amount=transaction.amount,
        currency=transaction.currency,
        description=transaction.description,
        status=transaction.status,
        transaction_date=transaction.transaction_date
    )

@router.post("/transactions/transfer", response_model=TransactionResponse)
async def create_transfer(
        transfer_data: TransferCreate,
        current_user: User = Depends(get_current_active_user)
):

    """Create a transfer between accounts"""
    try:
        from_account = await get_user_account(current_user)
        amount = Decimal(str(transfer_data.amount))

        if from_account.balance < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Solde insuffisant"
            )

        # Récupère le compte destinataire via son numéro de compte
        to_account = await get_account_by_number(transfer_data.to_account_number)

        if not to_account.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Le compte destinataire est inactif"
            )

        # Vérifie qu'il ne s'agit pas d'un transfert vers soi-même
        if from_account.id == to_account.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Impossible de transférer vers le même compte"
            )

        conversion_info = ""
        exchange_rate = Decimal(1)
        converted_amount = amount

        if from_account.currency != to_account.currency:
            exchange_rate = await get_exchange_rate(from_account.currency, to_account.currency)
            converted_amount = amount * exchange_rate
            conversion_info = f" (Taux de change: 1 {from_account.currency.value} = {exchange_rate} {to_account.currency.value})"

        to_account_user = await to_account.user.fetch()
        now = datetime.now(UTC)
        sender_transaction_id = f"TRN{uuid.uuid4().hex[:12].upper()}"
        recipient_transaction_id = f"TRN{uuid.uuid4().hex[:12].upper()}"

        sender_transaction = Transaction(
            transaction_id=sender_transaction_id,
            account=from_account,
            transaction_type=TransactionType.TRANSFER,
            amount=-float(amount),
            currency=from_account.currency,
            description=transfer_data.description or f"Transfert vers {to_account_user.full_name}{conversion_info}",
            status=TransactionStatus.COMPLETED,
            recipient_account=to_account,
            recipient_name=to_account_user.full_name,
            recipient_account_number=to_account.account_number,
            transaction_date=now
        )

        # Création de la transaction pour le destinataire
        recipient_transaction = Transaction(
            transaction_id=recipient_transaction_id,
            account=to_account,
            transaction_type=TransactionType.DEPOSIT,
            amount=float(converted_amount),  # Montant positif pour le destinataire
            currency=to_account.currency,
            description=f"Transfert de {current_user.full_name}{conversion_info}",
            status=TransactionStatus.COMPLETED,
            transaction_date=now
        )

        from_account.balance -= float(amount)
        from_account.last_transaction = now
        from_account.updated_at = now

        to_account.balance += float(converted_amount)
        to_account.last_transaction = now
        to_account.updated_at = now

        await asyncio.gather(
            sender_transaction.insert(),
            recipient_transaction.insert(),
            from_account.save(),
            to_account.save()
        )

        return TransactionResponse(
            id=sender_transaction.id,
            transaction_id=sender_transaction.transaction_id,
            account_id=str(from_account.id),
            transaction_type=sender_transaction.transaction_type,
            amount=sender_transaction.amount,
            currency=sender_transaction.currency,
            description=sender_transaction.description,
            status=sender_transaction.status,
            transaction_date=sender_transaction.transaction_date,
            recipient_name=sender_transaction.recipient_name,
            recipient_account_number=sender_transaction.recipient_account_number
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors du transfert: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors du transfert"
        )


@router.post("/currency/convert", response_model=ConversionResponse)
async def convert_currency(
        conversion_data: ConversionRequest,
        background_tasks: BackgroundTasks,
        current_user: User = Depends(get_current_active_user)
):
    """Convertit un montant d'une devise à une autre"""
    try:
        try:
            from_currency = Currency(conversion_data.from_currency)
            to_currency = Currency(conversion_data.to_currency)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Devise non supportée. Devises disponibles: USD, EUR, XOF"
            )

        # Programmez une mise à jour des taux en arrière-plan
        background_tasks.add_task(update_exchange_rates)

        exchange_rate = await get_exchange_rate(from_currency, to_currency)

        amount = Decimal(str(conversion_data.amount))
        converted_amount = amount * exchange_rate

        return ConversionResponse(
            from_currency=conversion_data.from_currency,
            to_currency=conversion_data.to_currency,
            amount=float(amount),
            converted_amount=float(converted_amount),
            exchange_rate=float(exchange_rate),
            date=datetime.now(UTC)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )