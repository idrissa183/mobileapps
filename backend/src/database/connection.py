from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import logging

from ..config.settings import get_settings
from ..models.user import User
from ..models.student import Student, Course, Assignment, Grade, Attendance
from ..models.banking import Account, Transaction, Card, TransferBeneficiary
from ..models.clothes import Product, Category, Brand, Review, UserPreference

settings = get_settings()

# MongoDB client
client = None


async def init_db():
    """Initialize MongoDB connection and register models with Beanie"""
    global client

    try:
        # Create a MongoDB client
        mongo_uri = settings.MONGODB_URI
        client = AsyncIOMotorClient(
            mongo_uri,
        )

        # Ping the database to verify the connection
        await client.admin.command('ping')

        # Initialize Beanie with the document models
        await init_beanie(
            database=client[settings.DB_NAME],
            document_models=[
                # User models
                User,

                # Student app models
                Student,
                Course,
                Assignment,
                Grade,
                Attendance,

                # Banking app models
                Account,
                Transaction,
                Card,
                TransferBeneficiary,

                # Clothes app models
                Product,
                Category,
                Brand,
                Review,
                UserPreference
            ]
        )

        logging.info(f"Connected to MongoDB at {settings.DB_HOST} successfully")
        print(f"Connected to MongoDB at {settings.DB_HOST} successfully")
    except Exception as e:
        logging.error(f"Failed to connect to MongoDB: {e}")
        print(f"Failed to connect to MongoDB: {e}")
        raise e


async def get_db():
    """Return database client"""
    if client is None:
        await init_db()
    return client[settings.DB_NAME]


async def close_db_connection():
    """Close database connection"""
    global client
    if client is not None:
        client.close()
        logging.info("MongoDB connection closed")
        print("MongoDB connection closed")
        client = None