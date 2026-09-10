from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "PackScan - AI Legal Metrology Verification System"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "doca_packscan_super_secret_jwt_key_sih_2024_secure"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    ALGORITHM: str = "HS256"

    # Database (Supabase PostgreSQL / Local PostgreSQL)
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/packscan_db"

    # Celery & Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    # Storage
    UPLOAD_DIR: str = "/tmp/packscan_uploads"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    model_config = SettingsConfigDict(
        env_file=(str(BACKEND_DIR / ".env"), ".env"),
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
