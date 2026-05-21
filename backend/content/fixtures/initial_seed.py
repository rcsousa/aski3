#!/usr/bin/env python3
"""
Standalone database seed script.

Run directly from the repo root (or from the fixtures directory) to populate
the database with all module content — useful for local development without
Docker or a running FastAPI process.

Usage
-----
    # From the backend directory:
    python content/fixtures/initial_seed.py

    # Or from this directory:
    python initial_seed.py

Environment
-----------
Requires DATABASE_URL to be set (or defaults to the value in app.core.config).
The database must already exist and be reachable.
"""

from __future__ import annotations

import asyncio
import logging
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Path bootstrap — allow running from any working directory
# ---------------------------------------------------------------------------

_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

# ---------------------------------------------------------------------------
# Imports (after path is fixed)
# ---------------------------------------------------------------------------

from app.db.database import AsyncSessionLocal, Base, engine  # noqa: E402
from app.services.content_loader import load_all_modules  # noqa: E402
from app.services.course_kg import build_course_kg  # noqa: E402

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("initial_seed")


# ---------------------------------------------------------------------------
# Async seed logic
# ---------------------------------------------------------------------------

async def seed() -> None:
    logger.info("Creating database tables (if not exist)…")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    logger.info("Loading module content from fixtures…")
    async with AsyncSessionLocal() as db:
        await load_all_modules(db)

    logger.info("Building course knowledge graph…")
    g = build_course_kg()
    logger.info("Course KG ready — %d triples.", len(g))

    await engine.dispose()
    logger.info("Seed complete.")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    asyncio.run(seed())
