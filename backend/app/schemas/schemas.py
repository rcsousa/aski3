import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

from app.models.models import QuizType


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserBase(BaseModel):
    email: EmailStr
    full_name: str


class UserCreate(UserBase):
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserUpdate(BaseModel):
    full_name: str | None = None
    is_active: bool | None = None


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    is_active: bool
    created_at: datetime


class CodeExampleBase(BaseModel):
    title: str
    description: str = ""
    language: str = "python"
    code: str
    expected_output: str = ""
    order: int = 0


class CodeExampleCreate(CodeExampleBase):
    section_id: int


class CodeExampleUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    language: str | None = None
    code: str | None = None
    expected_output: str | None = None
    order: int | None = None


class CodeExampleResponse(CodeExampleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    section_id: int


class QuizBase(BaseModel):
    question: str
    type: QuizType = QuizType.multiple_choice
    options: list[Any] = []
    correct_answer: str
    explanation: str = ""


class QuizCreate(QuizBase):
    section_id: int


class QuizUpdate(BaseModel):
    question: str | None = None
    type: QuizType | None = None
    options: list[Any] | None = None
    correct_answer: str | None = None
    explanation: str | None = None


class QuizResponse(QuizBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    section_id: int


class QuizPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    section_id: int
    question: str
    type: QuizType
    options: list[Any] = []


class SectionBase(BaseModel):
    title: str
    order: int = 0
    content_md: str = ""
    estimated_minutes: int = 0


class SectionCreate(SectionBase):
    course_id: int


class SectionUpdate(BaseModel):
    title: str | None = None
    order: int | None = None
    content_md: str | None = None
    estimated_minutes: int | None = None


class SectionSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    order: int
    estimated_minutes: int


class SectionResponse(SectionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    course_id: int
    examples: list[CodeExampleResponse] = []
    quizzes: list[QuizPublic] = []


class CourseBase(BaseModel):
    slug: str
    title: str
    description: str = ""
    order: int = 0
    estimated_minutes: int = 0


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    order: int | None = None
    estimated_minutes: int | None = None


class CourseListResponse(CourseBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sections: list[SectionSummary] = []


class CourseDetailResponse(CourseBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sections: list[SectionSummary] = []


class QuizSubmission(BaseModel):
    answers: dict[int, str]


class QuizResult(BaseModel):
    question_id: int
    question: str
    submitted_answer: str
    correct_answer: str
    is_correct: bool
    explanation: str


class QuizSubmissionResponse(BaseModel):
    score: float
    total: int
    correct: int
    results: list[QuizResult]


class UserProgressBase(BaseModel):
    section_id: int


class UserProgressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: uuid.UUID
    section_id: int
    completed_at: datetime | None
    quiz_score: float | None
    quiz_attempts: int
