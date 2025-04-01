from datetime import datetime, UTC
from enum import Enum
from typing import Dict, List, Optional

from beanie import Document, Indexed, Link
from pydantic import Field, field_validator, ValidationInfo

from ..models.user import User


class Size(str, Enum):
    XS = "XS"
    S = "S"
    M = "M"
    L = "L"
    XL = "XL"
    XXL = "XXL"
    XXXL = "XXXL"


class Gender(str, Enum):
    MEN = "men"
    WOMEN = "women"
    UNISEX = "unisex"
    KIDS = "kids"


class ProductStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    OUT_OF_STOCK = "out_of_stock"
    COMING_SOON = "coming_soon"


class Category(Document):
    """Category model for the clothes app"""
    name: Indexed(str, unique=True)
    description: Optional[str] = None
    parent_category: Optional[Link["Category"]] = None
    level: int = 1  # 1 = top level, 2 = subcategory, etc.
    image_url: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda : datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda : datetime.now(UTC))

    class Settings:
        name = "categories"


class Brand(Document):
    """Brand model for the clothes app"""
    name: Indexed(str, unique=True)
    description: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    country_of_origin: Optional[str] = None
    year_founded: Optional[int] = None
    is_featured: bool = False
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda : datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda : datetime.now(UTC))

    class Settings:
        name = "brands"


class Product(Document):
    """Product model for the clothes app"""
    sku: Indexed(str, unique=True)
    name: str
    description: str
    brand: Link[Brand]
    categories: List[Link[Category]] = []
    price: float
    sale_price: Optional[float] = None
    currency: str = "USD"

    # Product details
    colors: List[str] = []
    sizes: List[Size] = []
    gender: Gender = Gender.UNISEX
    material: Optional[str] = None
    care_instructions: Optional[str] = None

    # Images
    image_urls: List[str] = []
    thumbnail_url: Optional[str] = None

    # Inventory
    in_stock: bool = True
    stock_quantity: Dict[str, int] = {}  # Dict of size -> quantity
    status: ProductStatus = ProductStatus.ACTIVE

    # SEO and discovery
    tags: List[str] = []
    search_keywords: List[str] = []

    # Stats
    rating: float = 0.0
    review_count: int = 0
    view_count: int = 0

    created_at: datetime = Field(default_factory=lambda : datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda : datetime.now(UTC))

    class Settings:
        name = "products"

    class Config:
        use_enum_values = True

    @field_validator('sale_price')
    @classmethod
    def validate_sale_price(cls, v: Optional[float], info: ValidationInfo) -> Optional[float]:
        # Utilisation de ValidationInfo pour accéder aux données validées
        data = info.data
        if v is not None and 'price' in data and v > data['price']:
            raise ValueError('Sale price cannot be greater than regular price')
        return v


class Review(Document):
    """Review model for the clothes app"""
    user: Link[User]
    product: Link[Product]
    rating: int  # 1-5
    review_text: Optional[str] = None
    title: Optional[str] = None

    # Additional review details
    verified_purchase: bool = False
    size_purchased: Optional[Size] = None
    color_purchased: Optional[str] = None
    fit_feedback: Optional[str] = None  # "true to size", "runs small", "runs large"
    helpful_votes: int = 0

    created_at: datetime = Field(default_factory=lambda : datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda : datetime.now(UTC))

    class Settings:
        name = "reviews"

    class Config:
        use_enum_values = True

    @field_validator('rating')
    @classmethod
    def validate_rating(cls, v: int) -> int:
        if v < 1 or v > 5:
            raise ValueError('Rating must be between 1 and 5')
        return v


class UserPreference(Document):
    """User preferences for the clothes app"""
    user: Link[User]

    # Preferences
    favorite_categories: List[Link[Category]] = []
    favorite_brands: List[Link[Brand]] = []
    preferred_sizes: Dict[str, Size] = {}  # e.g., {"tops": "M", "bottoms": "L"}
    preferred_colors: List[str] = []

    # User behavior
    viewed_products: List[Link[Product]] = []
    wishlist: List[Link[Product]] = []
    recently_searched: List[str] = []

    # Personalization
    style_preferences: List[str] = []  # e.g., "casual", "formal", "sporty"

    created_at: datetime = Field(default_factory=lambda : datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda : datetime.now(UTC))

    class Settings:
        name = "user_preferences"

    class Config:
        use_enum_values = True