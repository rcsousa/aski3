from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import select

from app.api.routes import auth, courses, progress, quiz, sections
from app.api.routes import exec as exec_router
from app.api.routes import sparql as sparql_router
from app.api.routes import kg as kg_router
from app.core.security import get_password_hash
from app.db.database import engine, Base
from app.models.models import User
from app.services.content_loader import load_all_modules
from app.services.course_kg import build_course_kg
from app.db.database import AsyncSessionLocal

_DEFAULT_EMAIL = "admin@aski3.com"
_DEFAULT_PASSWORD = "aski3"


async def _seed_default_user(db: AsyncSessionLocal) -> None:
    result = await db.execute(select(User).where(User.email == _DEFAULT_EMAIL))
    if result.scalar_one_or_none() is None:
        db.add(User(
            email=_DEFAULT_EMAIL,
            hashed_password=get_password_hash(_DEFAULT_PASSWORD),
            full_name="Admin",
        ))
        await db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as db:
        await load_all_modules(db)
        await _seed_default_user(db)
    # Pre-build and cache the course knowledge graph at startup
    build_course_kg()
    yield
    await engine.dispose()


app = FastAPI(
    title="Semantica API",
    description="Backend API for the Semantics for AI Agents online course platform.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(sections.router)
app.include_router(quiz.router)
app.include_router(progress.router)
app.include_router(exec_router.router)
app.include_router(sparql_router.router)
app.include_router(kg_router.router)


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
