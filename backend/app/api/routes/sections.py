from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.models.models import Section
from app.schemas.schemas import SectionResponse

router = APIRouter(prefix="/sections", tags=["sections"])


@router.get("/{section_id}", response_model=SectionResponse)
async def get_section(section_id: int, db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(
        select(Section)
        .options(selectinload(Section.examples), selectinload(Section.quizzes))
        .where(Section.id == section_id)
    )
    section = result.scalar_one_or_none()
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    return section
