import json
import logging
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import CodeExample, Course, Quiz, QuizType, Section

logger = logging.getLogger(__name__)

CONTENT_DIR = Path("/home/user/aski3/backend/content/modules")


async def load_all_modules(db: AsyncSession) -> None:
    if not CONTENT_DIR.exists():
        logger.warning("Content directory %s does not exist, skipping seed", CONTENT_DIR)
        return

    module_dirs = sorted(CONTENT_DIR.glob("module_*/"))
    if not module_dirs:
        logger.info("No module directories found in %s", CONTENT_DIR)
        return

    for module_dir in module_dirs:
        content_file = module_dir / "content.json"
        if not content_file.exists():
            logger.warning("No content.json in %s, skipping", module_dir)
            continue
        try:
            data = json.loads(content_file.read_text(encoding="utf-8"))
            await _upsert_course(db, data)
            logger.info("Loaded module from %s", content_file)
        except Exception:
            logger.exception("Failed to load module from %s", content_file)

    await db.commit()


async def _upsert_course(db: AsyncSession, data: dict) -> None:
    slug = data.get("slug") or data["id"].replace("module-", "module-")
    result = await db.execute(select(Course).where(Course.slug == slug))
    course = result.scalar_one_or_none()

    if course is None:
        course = Course(
            slug=slug,
            title=data.get("title", slug),
            description=data.get("description", ""),
            order=data.get("order", 0),
            estimated_minutes=data.get("estimated_minutes", 0),
        )
        db.add(course)
        await db.flush()
    else:
        course.title = data.get("title", course.title)
        course.description = data.get("description", course.description)
        course.order = data.get("order", course.order)
        course.estimated_minutes = data.get("estimated_minutes", course.estimated_minutes)
        await db.flush()

    for section_data in data.get("sections", []):
        await _upsert_section(db, course.id, section_data)


async def _upsert_section(db: AsyncSession, course_id: int, data: dict) -> None:
    title = data["title"]
    order = data.get("order", 0)

    result = await db.execute(
        select(Section).where(Section.course_id == course_id, Section.order == order)
    )
    section = result.scalar_one_or_none()

    if section is None:
        section = Section(
            course_id=course_id,
            title=title,
            order=order,
            content_md=data.get("content_md", ""),
            estimated_minutes=data.get("estimated_minutes", 0),
        )
        db.add(section)
        await db.flush()
    else:
        section.title = title
        section.content_md = data.get("content_md", section.content_md)
        section.estimated_minutes = data.get("estimated_minutes", section.estimated_minutes)
        await db.flush()

    for example_data in data.get("code_examples", data.get("examples", [])):
        await _upsert_example(db, section.id, example_data)

    for quiz_data in data.get("quiz", data.get("quizzes", [])):
        await _upsert_quiz(db, section.id, quiz_data)


async def _upsert_example(db: AsyncSession, section_id: int, data: dict) -> None:
    order = data.get("order", 0)
    result = await db.execute(
        select(CodeExample).where(CodeExample.section_id == section_id, CodeExample.order == order)
    )
    example = result.scalar_one_or_none()

    if example is None:
        example = CodeExample(
            section_id=section_id,
            title=data.get("title", ""),
            description=data.get("description", ""),
            language=data.get("language", "python"),
            code=data.get("code", ""),
            expected_output=data.get("expected_output", ""),
            order=order,
        )
        db.add(example)
    else:
        example.title = data.get("title", example.title)
        example.description = data.get("description", example.description)
        example.language = data.get("language", example.language)
        example.code = data.get("code", example.code)
        example.expected_output = data.get("expected_output", example.expected_output)

    await db.flush()


async def _upsert_quiz(db: AsyncSession, section_id: int, data: dict) -> None:
    question = data["question"]
    result = await db.execute(
        select(Quiz).where(Quiz.section_id == section_id, Quiz.question == question)
    )
    quiz = result.scalar_one_or_none()

    quiz_type_raw = data.get("type", "multiple_choice")
    try:
        quiz_type = QuizType(quiz_type_raw)
    except ValueError:
        quiz_type = QuizType.multiple_choice

    if quiz is None:
        correct = data.get("correct_answer") or str(data.get("correct", ""))
        quiz = Quiz(
            section_id=section_id,
            question=question,
            type=quiz_type,
            options=data.get("options", []),
            correct_answer=correct,
            explanation=data.get("explanation", ""),
        )
        db.add(quiz)
    else:
        correct = data.get("correct_answer") or str(data.get("correct", quiz.correct_answer))
        quiz.type = quiz_type
        quiz.options = data.get("options", quiz.options)
        quiz.correct_answer = correct
        quiz.explanation = data.get("explanation", quiz.explanation)

    await db.flush()
