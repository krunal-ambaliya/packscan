import asyncio
from backend.app.core.database import AsyncSessionLocal
from sqlalchemy import text

async def f():
    async with AsyncSessionLocal() as s:
        print(await s.scalar(text('SELECT COUNT(*) FROM users')))
        print(await s.scalar(text('SELECT COUNT(*) FROM products')))
asyncio.run(f())
