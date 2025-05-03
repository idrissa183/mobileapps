import uuid
from typing import Optional, List

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, status, HTTPException
from datetime import date, datetime

from pydantic import BaseModel, Field

from src.api.v1.auth import get_current_active_user
from src.models.banking import CardType, Account, Card, CardStatus
from src.models.user import User

router = APIRouter()

class CardCreate(BaseModel):
    card_type: Optional[CardType] = CardType.DEBIT
    card_name: str = Field(..., min_length=2, max_length=50)
    daily_limit: Optional[float] = Field(1000000.0, gt=0)
    is_contactless: Optional[bool] = True
    is_virtual: Optional[bool] = False
    purpose: Optional[str] = Field(None, max_length=100)

class CardResponse(BaseModel):
    id: PydanticObjectId
    card_number: str
    card_type: str
    card_name: str
    expiry_date: date
    is_contactless: bool
    daily_limit: float
    status: str
    is_virtual: bool
    purpose: Optional[str] = None
    created_at: datetime


def mask_card_number(card_number: str) -> str:
    """Mask card number except last 4 digits"""
    if not card_number or len(card_number) < 4:
        return card_number
    masked_part = '*' * (len(card_number) - 4)
    return f"{masked_part}{card_number[-4:]}"


@router.post("/cards", response_model=CardResponse, status_code=status.HTTP_201_CREATED)
async def create_card(
        card_data: CardCreate,
        current_user: User = Depends(get_current_active_user)
):
    """
        Créer une nouvelle carte bancaire pour l'utilisateur connecté
    """
    # Vérifier que l'utilisateur a un compte bancaire principal
    account = await Account.find_one({"user.$id": current_user.id}, Account.is_primary == True)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous devez avoir un compte bancaire principal pour créer une carte"
        )
    card_number = f"4{''.join(str(uuid.uuid4().int)[:15])}"

    today = date.today()
    expiry_date = date(today.year + 3, today.month, 1)
    cvv = f"{uuid.uuid4().int % 1000:03d}"

    card = Card(
        user=current_user,
        card_number=card_number,
        card_type=card_data.card_type,
        card_name=card_data.card_name,
        expiry_date=expiry_date,
        cvv=cvv,
        is_contactless=card_data.is_contactless,
        daily_limit=card_data.daily_limit,
        is_virtual=card_data.is_virtual,
        purpose=card_data.purpose,
        status=CardStatus.ACTIVE
    )

    await card.insert()

    return CardResponse(
        id=card.id,
        card_number=mask_card_number(card.card_number),
        card_type=card.card_type,
        card_name=card.card_name,
        expiry_date=card.expiry_date,
        is_contactless=card.is_contactless,
        daily_limit=card.daily_limit,
        status=card.status,
        is_virtual=card.is_virtual,
        purpose=card.purpose,
        created_at=card.created_at
    )


@router.get("/cards/{card_id}", response_model=CardResponse)
async def get_card_details(
    card_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
        Récupérer les détails d'une carte spécifique appartenant à l'utilisateur connecté
    """
    try:
        card_oid = PydanticObjectId(card_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de carte invalide"
        )
    card = await Card.find_one(Card.id == card_oid, {"user.$id": current_user.id})
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Carte non trouvée ou vous n'avez pas l'autorisation"
        )

    return CardResponse(
        id=card.id,
        card_number=mask_card_number(card.card_number),
        card_type=card.card_type,
        card_name=card.card_name,
        expiry_date=card.expiry_date,
        is_contactless=card.is_contactless,
        daily_limit=card.daily_limit,
        status=card.status,
        is_virtual=card.is_virtual,
        purpose=card.purpose,
        created_at=card.created_at
    )


@router.get("/cards", response_model=List[CardResponse])
async def get_user_cards(
    current_user: User = Depends(get_current_active_user)
):
    """
        Récupérer toutes les cartes de l'utilisateur connecté
    """
    cards = await Card.find({"user.$id": current_user.id}).to_list()
    return [
        CardResponse(
            id=card.id,
            card_number=mask_card_number(card.card_number),
            card_type=card.card_type,
            card_name=card.card_name,
            expiry_date=card.expiry_date,
            is_contactless=card.is_contactless,
            daily_limit=card.daily_limit,
            status=card.status,
            is_virtual=card.is_virtual,
            purpose=card.purpose,
            created_at=card.created_at
        )
        for card in cards
    ]
