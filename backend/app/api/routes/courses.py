from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.models.models import Course
from app.schemas.schemas import CourseDetailResponse, CourseListResponse

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("", response_model=list[CourseListResponse])
async def list_courses(db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(
        select(Course).options(selectinload(Course.sections)).order_by(Course.order)
    )
    return result.scalars().all()


@router.get("/{slug}", response_model=CourseDetailResponse)
async def get_course(slug: str, db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(
        select(Course).options(selectinload(Course.sections)).where(Course.slug == slug)
    )
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return course
