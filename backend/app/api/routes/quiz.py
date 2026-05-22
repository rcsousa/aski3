from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.models import Quiz, User, UserProgress
from app.schemas.schemas import QuizAnswerDetail, QuizResult, QuizResultResponse, QuizSubmission

router = APIRouter(prefix="/quiz", tags=["quiz"])


@router.post("/{section_id}/submit", response_model=QuizResultResponse)
async def submit_quiz(
    section_id: int,
    submission: QuizSubmission,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Quiz).where(Quiz.section_id == section_id))
    quizzes = result.scalars().all()

    if not quizzes:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No quiz found for this section")

    results: list[QuizResult] = []
    correct_count = 0

    for quiz in quizzes:
        submitted = submission.answers.get(quiz.id)
        if submitted is None:
            submitted = ""
        is_correct = submitted.strip().lower() == quiz.correct_answer.strip().lower()
        if is_correct:
            correct_count += 1
        results.append(
            QuizResult(
                question_id=quiz.id,
                question=quiz.question,
                submitted_answer=submitted,
                correct_answer=quiz.correct_answer,
                is_correct=is_correct,
                explanation=quiz.explanation,
            )
        )

    total = len(quizzes)
    score = round(correct_count / total * 100, 2) if total > 0 else 0.0

    progress_result = await db.execute(
        select(UserProgress).where(
            UserProgress.user_id == current_user.id,
            UserProgress.section_id == section_id,
        )
    )
    progress = progress_result.scalar_one_or_none()

    if progress:
        progress.quiz_attempts += 1
        if progress.quiz_score is None or score > progress.quiz_score:
            progress.quiz_score = score
    else:
        progress = UserProgress(
            user_id=current_user.id,
            section_id=section_id,
            quiz_score=score,
            quiz_attempts=1,
        )
        db.add(progress)

    await db.flush()

    percentage = round(correct_count / total * 100, 1) if total > 0 else 0.0
    return QuizResultResponse(
        score=correct_count,
        total=total,
        percentage=percentage,
        passed=percentage >= 70.0,
        details=[
            QuizAnswerDetail(
                question_id=r.question_id,
                correct=r.is_correct,
                correct_answer=r.correct_answer,
                explanation=r.explanation,
            )
            for r in results
        ],
    )
