from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.models import Section, User, UserProgress
from app.schemas.schemas import UserProgressResponse

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("/me", response_model=list[UserProgressResponse])
async def get_my_progress(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(UserProgress).where(UserProgress.user_id == current_user.id)
    )
    return result.scalars().all()


@router.post("/{section_id}/complete", response_model=UserProgressResponse, status_code=status.HTTP_200_OK)
async def complete_section(
    section_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    section_result = await db.execute(select(Section).where(Section.id == section_id))
    if not section_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")

    result = await db.execute(
        select(UserProgress).where(
            UserProgress.user_id == current_user.id,
            UserProgress.section_id == section_id,
        )
    )
    progress = result.scalar_one_or_none()

    now = datetime.now(timezone.utc)

    if progress:
        progress.completed_at = now
    else:
        progress = UserProgress(
            user_id=current_user.id,
            section_id=section_id,
            completed_at=now,
        )
        db.add(progress)

    await db.flush()
    await db.refresh(progress)
    return progress
