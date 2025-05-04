from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from src.api.v1.auth import get_current_active_user
from src.models.user import User
from src.models.banking import Account
from pydantic import BaseModel

router = APIRouter()

class AccountResponse(BaseModel):
    id: PydanticObjectId
    account_number: str
    account_name: str
    balance: float
    currency: str
    is_active: bool
    is_primary: bool
    created_at: str
    updated_at: str
    last_transaction: str = None

@router.get("/accounts", response_model=AccountResponse)
async def get_user_account(current_user: User = Depends(get_current_active_user)):
    """Récupère le compte bancaire de l'utilisateur connecté"""
    if not current_user.uses_banking_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Banking app is not enabled for this user"
        )

    account = await Account.find_one({"user.$id": current_user.id})
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found for this user"
        )

    return AccountResponse(
        id=account.id,
        account_number=account.account_number,
        account_name=account.account_name,
        balance=account.balance,
        currency=account.currency,
        is_active=account.is_active,
        is_primary=account.is_primary,
        created_at=account.created_at.isoformat(),
        updated_at=account.updated_at.isoformat(),
        last_transaction=account.last_transaction.isoformat() if account.last_transaction else None
    )