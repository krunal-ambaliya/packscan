import ssl
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from backend.app.core.config import settings
from backend.app.models.base import Base

def get_engine_args(url: str) -> dict:
    connect_args = {}
    
    # Supabase PostgreSQL requires SSL in cloud environments
    if "supabase.co" in url or "supabase.com" in url or "ssl=require" in url or "sslmode=require" in url:
        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE
        connect_args["ssl"] = ssl_ctx
        
    # If connecting through Supabase PgBouncer/Supavisor pooler (port 6543 or pooler.supabase.com),
    # disable asyncpg statement cache to prevent prepared statement errors
    if ":6543" in url or "pooler.supabase.com" in url:
        connect_args["statement_cache_size"] = 0

    return connect_args

# Ensure scheme uses asyncpg driver
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+asyncpg://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Strip conflicting query params for asyncpg if present
clean_url = db_url.replace("?sslmode=require", "").replace("&sslmode=require", "")

engine = create_async_engine(
    clean_url,
    echo=False,
    future=True,
    pool_pre_ping=True,
    connect_args=get_engine_args(db_url)
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for obtaining an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db() -> None:
    """Creates all database tables defined in Base models on Supabase/PostgreSQL."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ PackScan database tables successfully initialized on Supabase PostgreSQL.")

if __name__ == "__main__":
    import asyncio
    asyncio.run(init_db())
