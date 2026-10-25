from datetime import date, time
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

Status = Literal["attended", "missed", "cancelled"]
Priority = Literal["low", "medium", "high"]


class SubjectBase(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    course_code: str | None = Field(default=None, max_length=40)
    attendance_target: float = Field(default=75, ge=0, le=100)


class SubjectCreate(SubjectBase):
    pass


class SubjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    course_code: str | None = Field(default=None, max_length=40)
    attendance_target: float | None = Field(default=None, ge=0, le=100)


class SubjectRead(SubjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class AttendanceCreate(BaseModel):
    session_date: date
    status: Status


class AttendanceRead(AttendanceCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    subject_id: int


class AttendanceSummary(BaseModel):
    held: int
    attended: int
    missed: int
    cancelled: int
    percentage: float | None
    target: float
    classes_to_target: int | None
    can_miss: int | None


class TaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    subject_id: int | None = None
    due_date: date
    due_time: time | None = None
    priority: Priority = "medium"
    completed: bool = False


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    subject_id: int | None = None
    due_date: date | None = None
    due_time: time | None = None
    priority: Priority | None = None
    completed: bool | None = None


class TaskRead(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class EventBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    event_date: date
    event_time: time | None = None
    subject_id: int | None = None


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    event_date: date | None = None
    event_time: time | None = None
    subject_id: int | None = None


class EventRead(EventBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
