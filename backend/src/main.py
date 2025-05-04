from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from src.config.settings import get_settings
from src.database.connection import init_db, close_db_connection
from src.api.v1.auth import router as auth_router
from src.api.v1.student import router as student_router
# from src.api.v1.banking import router as banking_router
from src.api.v1.clothes import router as clothes_router
from src.api.v1.card import router as card_router
from src.api.v1.contact import router as contact_router
from src.api.v1.transaction import router as transaction_router



# Get settings
settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db_connection()


# Initialize app
app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.VERSION,
    debug=settings.DEBUG,
    docs_url=f"{settings.API_PREFIX}/docs",
    redoc_url=f"{settings.API_PREFIX}/redoc",
    lifespan=lifespan,
)


# Add CORS middleware
origins = settings.CORS_ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    # allow_origins=origins if isinstance(origins, List) else [origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)


# Root endpoint
@app.get("/", include_in_schema=False)
async def root():
    return JSONResponse(
        status_code=200,
        content={
            "message": "Welcome to the Unified Mobile Apps API",
            "docs": f"{settings.API_PREFIX}/docs"
        }
    )


# Health check endpoint
@app.get("/health", include_in_schema=False)
async def health_check():
    return {"status": "healthy"}


# Include routers with prefix
app.include_router(auth_router, prefix=f"{settings.API_PREFIX}/auth", tags=["Authentication"])
app.include_router(card_router, prefix=f"{settings.API_PREFIX}/banking", tags=["Cards"])
app.include_router(contact_router, prefix=f"{settings.API_PREFIX}/banking", tags=["Contacts"])
app.include_router(transaction_router, prefix=f"{settings.API_PREFIX}/banking", tags=["Transactions"])
app.include_router(student_router, prefix=f"{settings.API_PREFIX}/student", tags=["Student App"])
# app.include_router(banking_router, prefix=f"{settings.API_PREFIX}/banking", tags=["Banking App"])
app.include_router(clothes_router, prefix=f"{settings.API_PREFIX}/clothes", tags=["Clothes App"])



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)