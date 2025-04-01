from typing import List, Optional, Dict
from datetime import datetime, UTC

from fastapi import APIRouter, Depends, HTTPException, Query, status, Path
from pydantic import BaseModel, Field

from ..v1.auth import get_current_active_user
from ...models.user import User
from ...models.clothes import (
    Product, Category, Brand, Review, UserPreference,
    Size, Gender, ProductStatus
)
from ...config.settings import get_settings

settings = get_settings()
router = APIRouter()


# Schema models for request and response
class CategoryResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    parent_category_id: Optional[str] = None
    level: int
    image_url: Optional[str] = None


class BrandResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    country_of_origin: Optional[str] = None
    year_founded: Optional[int] = None
    is_featured: bool


class ProductResponse(BaseModel):
    id: str
    sku: str
    name: str
    description: str
    brand_id: str
    brand_name: str
    categories: List[CategoryResponse] = []
    price: float
    sale_price: Optional[float] = None
    currency: str
    colors: List[str] = []
    sizes: List[str] = []
    gender: str
    material: Optional[str] = None
    care_instructions: Optional[str] = None
    image_urls: List[str] = []
    thumbnail_url: Optional[str] = None
    in_stock: bool
    available_sizes: Dict[str, int] = {}  # Size -> quantity
    status: str
    tags: List[str] = []
    rating: float
    review_count: int


class ReviewResponse(BaseModel):
    id: str
    user_id: str
    user_name: str
    product_id: str
    product_name: str
    rating: int
    review_text: Optional[str] = None
    title: Optional[str] = None
    verified_purchase: bool
    size_purchased: Optional[str] = None
    color_purchased: Optional[str] = None
    fit_feedback: Optional[str] = None
    helpful_votes: int
    created_at: datetime


class UserPreferenceResponse(BaseModel):
    favorite_categories: List[CategoryResponse] = []
    favorite_brands: List[BrandResponse] = []
    preferred_sizes: Dict[str, str] = {}
    preferred_colors: List[str] = []
    style_preferences: List[str] = []
    recently_viewed_products: List[ProductResponse] = []
    wishlist_products: List[ProductResponse] = []
    recently_searched: List[str] = []


class ReviewCreate(BaseModel):
    product_id: str
    rating: int
    review_text: Optional[str] = None
    title: Optional[str] = None
    size_purchased: Optional[Size] = None
    color_purchased: Optional[str] = None
    fit_feedback: Optional[str] = None


class ProductSearchParams(BaseModel):
    query: Optional[str] = None
    category_ids: Optional[List[str]] = None
    brand_ids: Optional[List[str]] = None
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    sizes: Optional[List[Size]] = None
    colors: Optional[List[str]] = None
    gender: Optional[Gender] = None
    in_stock_only: bool = True
    sort_by: str = "relevance"  # relevance, price_asc, price_desc, rating, newest
    limit: int = Field(default=settings.CLOTHES_ITEMS_PER_PAGE)
    offset: int = 0


class UserPreferenceUpdate(BaseModel):
    add_favorite_category_ids: Optional[List[str]] = None
    remove_favorite_category_ids: Optional[List[str]] = None
    add_favorite_brand_ids: Optional[List[str]] = None
    remove_favorite_brand_ids: Optional[List[str]] = None
    preferred_sizes: Optional[Dict[str, Size]] = None
    preferred_colors: Optional[List[str]] = None
    style_preferences: Optional[List[str]] = None
    add_to_wishlist_product_ids: Optional[List[str]] = None
    remove_from_wishlist_product_ids: Optional[List[str]] = None


# Helper functions
async def get_user_preference(user: User) -> UserPreference:
    """Get or create user preference for the current user"""
    preference = await UserPreference.find_one(UserPreference.user.id == user.id)

    if not preference:
        preference = UserPreference(user=user)
        await preference.insert()

    return preference


async def record_product_view(user: User, product_id: str):
    """Record that a user viewed a product"""
    preference = await get_user_preference(user)

    # Get product
    product = await Product.get(product_id)
    if not product:
        return

    # Check if product is already in viewed list
    for i, viewed_product in enumerate(preference.viewed_products):
        if str(viewed_product.id) == product_id:
            # Remove from current position to add to front
            preference.viewed_products.pop(i)
            break

    # Add to front of viewed products list
    preference.viewed_products.insert(0, product)

    # Keep only the last 20 viewed products
    if len(preference.viewed_products) > 20:
        preference.viewed_products = preference.viewed_products[:20]

    # Update product view count
    product.view_count += 1

    # Save changes
    preference.updated_at = datetime.utcnow()
    await preference.save()
    await product.save()


async def record_search_query(user: User, query: str):
    """Record a search query for a user"""
    if not query or not query.strip():
        return

    preference = await get_user_preference(user)

    # Clean query
    clean_query = query.strip().lower()

    # Remove query if already in list
    if clean_query in preference.recently_searched:
        preference.recently_searched.remove(clean_query)

    # Add to front of list
    preference.recently_searched.insert(0, clean_query)

    # Keep only the last 10 searches
    if len(preference.recently_searched) > 10:
        preference.recently_searched = preference.recently_searched[:10]

    # Save changes
    preference.updated_at = datetime.utcnow()
    await preference.save()


# Routes
@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(
        parent_id: Optional[str] = None,
        level: Optional[int] = None,
        current_user: User = Depends(get_current_active_user)
):
    """Get product categories"""

    # Check if clothes app is enabled for user
    if not current_user.uses_clothes_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Clothes app is not enabled for this user"
        )

    # Build query
    query = {"is_active": True}
    if parent_id:
        query["parent_category.id"] = parent_id
    if level:
        query["level"] = level

    # Get categories
    categories = await Category.find(query).sort([("name", 1)]).to_list()

    # Create response
    return [
        CategoryResponse(
            id=str(category.id),
            name=category.name,
            description=category.description,
            parent_category_id=str(category.parent_category.id) if category.parent_category else None,
            level=category.level,
            image_url=category.image_url
        )
        for category in categories
    ]


@router.get("/brands", response_model=List[BrandResponse])
async def get_brands(
        featured_only: bool = False,
        current_user: User = Depends(get_current_active_user)
):
    """Get clothing brands"""

    # Check if clothes app is enabled for user
    if not current_user.uses_clothes_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Clothes app is not enabled for this user"
        )

    # Build query
    query = {"is_active": True}
    if featured_only:
        query["is_featured"] = True

    # Get brands
    brands = await Brand.find(query).sort([("name", 1)]).to_list()

    # Create response
    return [
        BrandResponse(
            id=str(brand.id),
            name=brand.name,
            description=brand.description,
            logo_url=brand.logo_url,
            website=brand.website,
            country_of_origin=brand.country_of_origin,
            year_founded=brand.year_founded,
            is_featured=brand.is_featured
        )
        for brand in brands
    ]


@router.get("/products/search", response_model=List[ProductResponse])
async def search_products(
        query: Optional[str] = None,
        category_id: Optional[str] = None,
        brand_id: Optional[str] = None,
        price_min: Optional[float] = None,
        price_max: Optional[float] = None,
        size: Optional[Size] = None,
        color: Optional[str] = None,
        gender: Optional[Gender] = None,
        in_stock_only: bool = True,
        sort_by: str = "relevance",
        limit: int = Query(default=settings.CLOTHES_ITEMS_PER_PAGE, ge=1, le=100),
        offset: int = Query(default=0, ge=0),
        current_user: User = Depends(get_current_active_user)
):
    """Search for products with various filters"""

    # Check if clothes app is enabled for user
    if not current_user.uses_clothes_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Clothes app is not enabled for this user"
        )

    # Record search query if provided
    if query:
        await record_search_query(current_user, query)

    # Build search query
    search_query = {"status": ProductStatus.ACTIVE}

    # Text search
    if query:
        search_terms = query.lower().strip().split()
        search_conditions = []
        for term in search_terms:
            search_conditions.append({"name": {"$regex": term, "$options": "i"}})
            search_conditions.append({"description": {"$regex": term, "$options": "i"}})
            search_conditions.append({"search_keywords": {"$in": [term]}})
            search_conditions.append({"tags": {"$in": [term]}})

        search_query["$or"] = search_conditions

    # Category filter
    if category_id:
        search_query["categories.id"] = category_id

    # Brand filter
    if brand_id:
        search_query["brand.id"] = brand_id

    # Price range filters
    price_filter = {}
    if price_min is not None:
        price_filter["$gte"] = price_min
    if price_max is not None:
        price_filter["$lte"] = price_max
    if price_filter:
        search_query["$or"] = [
            {"price": price_filter},
            {"sale_price": price_filter}
        ]

    # Size filter
    if size:
        search_query["sizes"] = {"$in": [size]}

    # Color filter
    if color:
        search_query["colors"] = {"$in": [color.lower()]}

    # Gender filter
    if gender:
        search_query["gender"] = {"$in": [gender, Gender.UNISEX]}

    # In stock filter
    if in_stock_only:
        search_query["in_stock"] = True

    # Determine sort order
    sort_options = {
        "relevance": [("rating", -1), ("review_count", -1)],
        "price_asc": [("sale_price", 1), ("price", 1)],
        "price_desc": [("sale_price", -1), ("price", -1)],
        "rating": [("rating", -1)],
        "newest": [("created_at", -1)]
    }

    sort_order = sort_options.get(sort_by, sort_options["relevance"])

    # Execute search query
    products = await Product.find(search_query).sort(sort_order).skip(offset).limit(limit).to_list()

    # Create response
    result = []
    for product in products:
        # Get brand info
        brand = await product.brand.fetch()

        # Get categories info
        categories = []
        for category_link in product.categories:
            category = await category_link.fetch()
            if category:
                categories.append(CategoryResponse(
                    id=str(category.id),
                    name=category.name,
                    description=category.description,
                    parent_category_id=str(category.parent_category.id) if category.parent_category else None,
                    level=category.level,
                    image_url=category.image_url
                ))

        # Add to result
        result.append(ProductResponse(
            id=str(product.id),
            sku=product.sku,
            name=product.name,
            description=product.description,
            brand_id=str(product.brand.id),
            brand_name=brand.name if brand else "Unknown Brand",
            categories=categories,
            price=product.price,
            sale_price=product.sale_price,
            currency=product.currency,
            colors=product.colors,
            sizes=[size for size in product.sizes],
            gender=product.gender,
            material=product.material,
            care_instructions=product.care_instructions,
            image_urls=product.image_urls,
            thumbnail_url=product.thumbnail_url,
            in_stock=product.in_stock,
            available_sizes=product.stock_quantity,
            status=product.status,
            tags=product.tags,
            rating=product.rating,
            review_count=product.review_count
        ))

    return result


@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product_details(
        product_id: str = Path(..., title="The ID of the product to get"),
        current_user: User = Depends(get_current_active_user)
):
    """Get detailed information about a product"""

    # Check if clothes app is enabled for user
    if not current_user.uses_clothes_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Clothes app is not enabled for this user"
        )

    # Get product
    product = await Product.get(product_id)
    if not product or product.status != ProductStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Record product view
    await record_product_view(current_user, product_id)

    # Get brand info
    brand = await product.brand.fetch()

    # Get categories info
    categories = []
    for category_link in product.categories:
        category = await category_link.fetch()
        if category:
            categories.append(CategoryResponse(
                id=str(category.id),
                name=category.name,
                description=category.description,
                parent_category_id=str(category.parent_category.id) if category.parent_category else None,
                level=category.level,
                image_url=category.image_url
            ))

    # Create response
    return ProductResponse(
        id=str(product.id),
        sku=product.sku,
        name=product.name,
        description=product.description,
        brand_id=str(product.brand.id),
        brand_name=brand.name if brand else "Unknown Brand",
        categories=categories,
        price=product.price,
        sale_price=product.sale_price,
        currency=product.currency,
        colors=product.colors,
        sizes=[size for size in product.sizes],
        gender=product.gender,
        material=product.material,
        care_instructions=product.care_instructions,
        image_urls=product.image_urls,
        thumbnail_url=product.thumbnail_url,
        in_stock=product.in_stock,
        available_sizes=product.stock_quantity,
        status=product.status,
        tags=product.tags,
        rating=product.rating,
        review_count=product.review_count
    )


@router.get("/products/{product_id}/reviews", response_model=List[ReviewResponse])
async def get_product_reviews(
        product_id: str = Path(..., title="The ID of the product to get reviews for"),
        limit: int = Query(10, ge=1, le=50),
        offset: int = Query(0, ge=0),
        current_user: User = Depends(get_current_active_user)
):
    """Get reviews for a product"""

    # Check if clothes app is enabled for user
    if not current_user.uses_clothes_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Clothes app is not enabled for this user"
        )

    # Check if product exists
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Get reviews
    reviews = await Review.find(Review.product.id == product_id).sort(
        [("helpful_votes", -1), ("created_at", -1)]
    ).skip(offset).limit(limit).to_list()

    # Create response
    result = []
    for review in reviews:
        # Get user info
        user = await review.user.fetch()

        result.append(ReviewResponse(
            id=str(review.id),
            user_id=str(review.user.id),
            user_name=user.full_name if user else "Anonymous",
            product_id=str(review.product.id),
            product_name=product.name,
            rating=review.rating,
            review_text=review.review_text,
            title=review.title,
            verified_purchase=review.verified_purchase,
            size_purchased=review.size_purchased,
            color_purchased=review.color_purchased,
            fit_feedback=review.fit_feedback,
            helpful_votes=review.helpful_votes,
            created_at=review.created_at
        ))

    return result


@router.post("/reviews", response_model=ReviewResponse)
async def create_review(
        review_data: ReviewCreate,
        current_user: User = Depends(get_current_active_user)
):
    """Create a review for a product"""

    # Check if clothes app is enabled for user
    if not current_user.uses_clothes_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Clothes app is not enabled for this user"
        )

    # Get product
    product = await Product.get(review_data.product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Check if user already reviewed this product
    existing_review = await Review.find_one({
        "user.id": current_user.id,
        "product.id": review_data.product_id
    })

    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this product"
        )

    # Create review
    review = Review(
        user=current_user,
        product=product,
        rating=review_data.rating,
        review_text=review_data.review_text,
        title=review_data.title,
        size_purchased=review_data.size_purchased,
        color_purchased=review_data.color_purchased,
        fit_feedback=review_data.fit_feedback
    )

    await review.insert()

    # Update product rating and review count
    all_reviews = await Review.find(Review.product.id == product.id).to_list()
    product.review_count = len(all_reviews)

    if product.review_count > 0:
        product.rating = sum(r.rating for r in all_reviews) / product.review_count

    await product.save()

    # Create response
    return ReviewResponse(
        id=str(review.id),
        user_id=str(review.user.id),
        user_name=current_user.full_name,
        product_id=str(review.product.id),
        product_name=product.name,
        rating=review.rating,
        review_text=review.review_text,
        title=review.title,
        verified_purchase=review.verified_purchase,
        size_purchased=review.size_purchased,
        color_purchased=review.color_purchased,
        fit_feedback=review.fit_feedback,
        helpful_votes=review.helpful_votes,
        created_at=review.created_at
    )


@router.get("/preferences", response_model=UserPreferenceResponse)
async def get_user_preferences(current_user: User = Depends(get_current_active_user)):
    """Get preferences for the current user"""

    # Check if clothes app is enabled for user
    if not current_user.uses_clothes_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Clothes app is not enabled for this user"
        )

    # Get user preferences
    preference = await get_user_preference(current_user)

    # Prepare data for response
    favorite_categories = []
    for category_link in preference.favorite_categories:
        category = await category_link.fetch()
        if category:
            favorite_categories.append(CategoryResponse(
                id=str(category.id),
                name=category.name,
                description=category.description,
                parent_category_id=str(category.parent_category.id) if category.parent_category else None,
                level=category.level,
                image_url=category.image_url
            ))

    favorite_brands = []
    for brand_link in preference.favorite_brands:
        brand = await brand_link.fetch()
        if brand:
            favorite_brands.append(BrandResponse(
                id=str(brand.id),
                name=brand.name,
                description=brand.description,
                logo_url=brand.logo_url,
                website=brand.website,
                country_of_origin=brand.country_of_origin,
                year_founded=brand.year_founded,
                is_featured=brand.is_featured
            ))

    recently_viewed_products = []
    for product_link in preference.viewed_products[:10]:  # Limit to 10 most recent
        product = await product_link.fetch()
        if product and product.status == ProductStatus.ACTIVE:
            brand = await product.brand.fetch()

            # Get categories
            categories = []
            for category_link in product.categories:
                category = await category_link.fetch()
                if category:
                    categories.append(CategoryResponse(
                        id=str(category.id),
                        name=category.name,
                        description=category.description,
                        parent_category_id=str(category.parent_category.id) if category.parent_category else None,
                        level=category.level,
                        image_url=category.image_url
                    ))

            recently_viewed_products.append(ProductResponse(
                id=str(product.id),
                sku=product.sku,
                name=product.name,
                description=product.description,
                brand_id=str(product.brand.id),
                brand_name=brand.name if brand else "Unknown Brand",
                categories=categories,
                price=product.price,
                sale_price=product.sale_price,
                currency=product.currency,
                colors=product.colors,
                sizes=[size for size in product.sizes],
                gender=product.gender,
                material=product.material,
                care_instructions=product.care_instructions,
                image_urls=product.image_urls,
                thumbnail_url=product.thumbnail_url,
                in_stock=product.in_stock,
                available_sizes=product.stock_quantity,
                status=product.status,
                tags=product.tags,
                rating=product.rating,
                review_count=product.review_count
            ))

    wishlist_products = []
    for product_link in preference.wishlist:
        product = await product_link.fetch()
        if product and product.status == ProductStatus.ACTIVE:
            brand = await product.brand.fetch()

            # Get categories
            categories = []
            for category_link in product.categories:
                category = await category_link.fetch()
                if category:
                    categories.append(CategoryResponse(
                        id=str(category.id),
                        name=category.name,
                        description=category.description,
                        parent_category_id=str(category.parent_category.id) if category.parent_category else None,
                        level=category.level,
                        image_url=category.image_url
                    ))

            wishlist_products.append(ProductResponse(
                id=str(product.id),
                sku=product.sku,
                name=product.name,
                description=product.description,
                brand_id=str(product.brand.id),
                brand_name=brand.name if brand else "Unknown Brand",
                categories=categories,
                price=product.price,
                sale_price=product.sale_price,
                currency=product.currency,
                colors=product.colors,
                sizes=[size for size in product.sizes],
                gender=product.gender,
                material=product.material,
                care_instructions=product.care_instructions,
                image_urls=product.image_urls,
                thumbnail_url=product.thumbnail_url,
                in_stock=product.in_stock,
                available_sizes=product.stock_quantity,
                status=product.status,
                tags=product.tags,
                rating=product.rating,
                review_count=product.review_count
            ))

    return UserPreferenceResponse(
        favorite_categories=favorite_categories,
        favorite_brands=favorite_brands,
        preferred_sizes={k: v for k, v in preference.preferred_sizes.items()},
        preferred_colors=preference.preferred_colors,
        style_preferences=preference.style_preferences,
        recently_viewed_products=recently_viewed_products,
        wishlist_products=wishlist_products,
        recently_searched=preference.recently_searched
    )


@router.patch("/preferences", response_model=UserPreferenceResponse)
async def update_user_preferences(
        preferences: UserPreferenceUpdate,
        current_user: User = Depends(get_current_active_user)
):
    """Update preferences for the current user"""

    # Check if clothes app is enabled for user
    if not current_user.uses_clothes_app:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Clothes app is not enabled for this user"
        )

    # Get user preferences
    preference = await get_user_preference(current_user)

    # Update favorite categories
    if preferences.add_favorite_category_ids:
        for category_id in preferences.add_favorite_category_ids:
            category = await Category.get(category_id)
            if category and not any(str(c.id) == category_id for c in preference.favorite_categories):
                preference.favorite_categories.append(category)

    if preferences.remove_favorite_category_ids:
        preference.favorite_categories = [
            c for c in preference.favorite_categories
            if str(c.id) not in preferences.remove_favorite_category_ids
        ]

    # Update favorite brands
    if preferences.add_favorite_brand_ids:
        for brand_id in preferences.add_favorite_brand_ids:
            brand = await Brand.get(brand_id)
            if brand and not any(str(b.id) == brand_id for b in preference.favorite_brands):
                preference.favorite_brands.append(brand)

    if preferences.remove_favorite_brand_ids:
        preference.favorite_brands = [
            b for b in preference.favorite_brands
            if str(b.id) not in preferences.remove_favorite_brand_ids
        ]

    # Update preferred sizes
    if preferences.preferred_sizes:
        preference.preferred_sizes.update(preferences.preferred_sizes)

    # Update preferred colors
    if preferences.preferred_colors:
        preference.preferred_colors = preferences.preferred_colors

    # Update style preferences
    if preferences.style_preferences:
        preference.style_preferences = preferences.style_preferences

    # Update wishlist
    if preferences.add_to_wishlist_product_ids:
        for product_id in preferences.add_to_wishlist_product_ids:
            product = await Product.get(product_id)
            if product and not any(str(p.id) == product_id for p in preference.wishlist):
                preference.wishlist.append(product)

    if preferences.remove_from_wishlist_product_ids:
        preference.wishlist = [
            p for p in preference.wishlist
            if str(p.id) not in preferences.remove_from_wishlist_product_ids
        ]

    # Save changes
    preference.updated_at = datetime.now(UTC)
    await preference.save()

    # Return updated preferences
    return await get_user_preferences(current_user)