
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql:postgresql://neondb_owner:npg_ZpE4mOX6waST@ep-frosty-tooth-b5ezv41a-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Database connection settings
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 1800,
    }

