import logging
from typing import List, Optional

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel, EmailStr

from src.api.v1.auth import get_current_active_user
from src.models.banking import Account
from src.models.user import User, UserStatus


logger = logging.getLogger(__name__)
router = APIRouter()


class ContactResponse(BaseModel):
    id: PydanticObjectId
    user_id: PydanticObjectId
    username: str
    full_name: str
    email: EmailStr
    profile_image: Optional[str] = None
    account_number: str
    account_name: str
    phone: Optional[str] = None



@router.get("/contacts", response_model=List[ContactResponse])
async def get_contacts(
    search: str = Query(None, description="Filtrer par nom d'utilisateur, nom complet ou email"),
    limit: int = Query(20, ge=1, le=100),
    skip: int = Query(0, ge=0),
    current_user: User = Depends(get_current_active_user)
):
    try:
        base_query = {
            "status": UserStatus.ACTIVE,
            "is_email_verified": True,
            "uses_banking_app": True,
            "_id": {"$ne": current_user.id}
        }

        if search:
            base_query["$text"] = {"$search": search}

        users = await User.find(base_query).skip(skip).limit(limit).to_list()

        contacts: List[ContactResponse] = []
        for user in users:
            account = await Account.find_one({"user.$id": user.id})
            if account:
                contacts.append(ContactResponse(
                    id=account.id,
                    user_id=user.id,
                    username=user.username,
                    full_name=user.full_name,
                    email=user.email,
                    profile_image=user.profile_image,
                    account_number=account.account_number,
                    account_name=account.account_name,
                    phone=user.phone
                ))
        return contacts

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des contacts: {str(e)}"
        )


@router.get("/contacts/{contact_id}", response_model=ContactResponse)
async def get_contact_by_id(
        contact_id: PydanticObjectId,
        current_user: User = Depends(get_current_active_user)
):
    """
    Récupère les détails d'un contact spécifique par ID
    """
    try:
        if current_user.id == contact_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vous ne pouvez pas vous sélectionner comme contact"
            )

        user = await User.get(contact_id)

        if not user or user.status != UserStatus.ACTIVE or not user.is_email_verified or not user.uses_banking_app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contact non trouvé"
            )

        account = await Account.find_one({"user.$id": user.id})
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Aucun compte trouvé pour ce contact"
            )

        return ContactResponse(
            id=account.id,
            user_id=user.id,
            username=user.username,
            full_name=user.full_name,
            email=user.email,
            profile_image=user.profile_image,
            account_number = account.account_number,
            account_name=account.account_name,
            phone=user.phone,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération du contact: {str(e)}"
        )
