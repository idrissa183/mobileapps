# import logging
# from datetime import datetime, UTC
# from typing import List, Optional
#
# from fastapi import APIRouter, Depends, HTTPException, status
# from pydantic import BaseModel, Field
# from beanie import PydanticObjectId
#
# from src.api.v1.auth import get_current_active_user
# from src.models.user import User
# from src.models.banking import Account, Currency
#
# logger = logging.getLogger(__name__)
# router = APIRouter()
#
#
# class AccountCreate(BaseModel):
#     """Modèle pour la création d'un compte"""
#     currency: Currency = Currency.USD
#     initial_balance: float = 0.0
#
#
# class AccountResponse(BaseModel):
#     """Modèle de réponse pour un compte"""
#     id: PydanticObjectId = Field(..., alias="_id")
#     account_number: str
#     balance: float
#     currency: Currency
#     is_active: bool
#     created_at: datetime
#
#     class Config:
#         allow_population_by_field_name = True
#         use_enum_values = True
#
#
# @router.post("/accounts", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
# async def create_account(
#         account_data: AccountCreate,
#         current_user: User = Depends(get_current_active_user)
# ):
#     # Vérifier si l'utilisateur a accès à l'application bancaire
#     if not current_user.uses_banking_app:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="L'application bancaire n'est pas activée pour cet utilisateur"
#         )
#
#     # Générer un numéro de compte unique
#     account_number = f"AC{datetime.now(UTC).strftime('%Y%m%d')}{current_user.id[-6:].upper()}"
#
#     # Créer le compte
#     account = Account(
#         user=current_user,
#         account_number=account_number,
#         balance=account_data.initial_balance,
#         currency=account_data.currency
#     )
#
#     try:
#         await account.insert()
#     except Exception as e:
#         logger.error(f"Erreur lors de la création du compte: {str(e)}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Une erreur est survenue lors de la création du compte"
#         )
#
#     return AccountResponse(**account.dict())
#
#
# @router.get("/accounts", response_model=List[AccountResponse])
# async def get_user_accounts(
#         current_user: User = Depends(get_current_active_user)
# ):
#     if not current_user.uses_banking_app:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="L'application bancaire n'est pas activée pour cet utilisateur"
#         )
#
#     accounts = await Account.find(Account.user.id == current_user.id).to_list()
#     return [AccountResponse(**acc.dict()) for acc in accounts]
