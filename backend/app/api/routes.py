from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import AttendanceSession, CalendarEvent, Subject, Task
from app.schemas import (
    AttendanceCreate, AttendanceRead, AttendanceSummary, EventCreate, EventRead, EventUpdate,
    SubjectCreate, SubjectRead, SubjectUpdate, TaskCreate, TaskRead, TaskUpdate,
)
from app.services.attendance import calculate_summary

router = APIRouter()


def subject_or_404(db: Session, subject_id: int) -> Subject:
    subject = db.get(Subject, subject_id)
    if subject is None:
        raise HTTPException(status_code=404, detail="Subject not found")
    return subject


def ensure_subject(db: Session, subject_id: int | None) -> None:
    if subject_id is not None:
        subject_or_404(db, subject_id)


@router.get("/subjects", response_model=list[SubjectRead])
def list_subjects(db: Session = Depends(get_db)):
    return db.scalars(select(Subject).order_by(Subject.name)).all()


@router.post("/subjects", response_model=SubjectRead, status_code=status.HTTP_201_CREATED)
def create_subject(payload: SubjectCreate, db: Session = Depends(get_db)):
    subject = Subject(**payload.model_dump())
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject


@router.patch("/subjects/{subject_id}", response_model=SubjectRead)
def update_subject(subject_id: int, payload: SubjectUpdate, db: Session = Depends(get_db)):
    subject = subject_or_404(db, subject_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(subject, key, value)
    db.commit()
    db.refresh(subject)
    return subject


@router.delete("/subjects/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subject(subject_id: int, db: Session = Depends(get_db)):
    subject = subject_or_404(db, subject_id)
    db.delete(subject)
    db.commit()


@router.get("/subjects/{subject_id}/attendance", response_model=list[AttendanceRead])
def list_attendance(subject_id: int, db: Session = Depends(get_db)):
    subject_or_404(db, subject_id)
    return db.scalars(select(AttendanceSession).where(AttendanceSession.subject_id == subject_id).order_by(AttendanceSession.session_date.desc())).all()


@router.get("/subjects/{subject_id}/attendance/summary", response_model=AttendanceSummary)
def attendance_summary(subject_id: int, db: Session = Depends(get_db)):
    subject = subject_or_404(db, subject_id)
    sessions = db.scalars(select(AttendanceSession).where(AttendanceSession.subject_id == subject_id)).all()
    counts = {key: sum(session.status == key for session in sessions) for key in ("attended", "missed", "cancelled")}
    return calculate_summary(counts["attended"], counts["missed"], counts["cancelled"], subject.attendance_target)


@router.post("/subjects/{subject_id}/attendance", response_model=AttendanceRead, status_code=status.HTTP_201_CREATED)
def create_attendance(subject_id: int, payload: AttendanceCreate, db: Session = Depends(get_db)):
    subject_or_404(db, subject_id)
    session = AttendanceSession(subject_id=subject_id, **payload.model_dump())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.delete("/attendance/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attendance(attendance_id: int, db: Session = Depends(get_db)):
    session = db.get(AttendanceSession, attendance_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Attendance session not found")
    db.delete(session)
    db.commit()


@router.get("/tasks", response_model=list[TaskRead])
def list_tasks(
    filter: str | None = Query(default=None, pattern="^(upcoming|overdue|completed)$"),
    db: Session = Depends(get_db),
):
    query = select(Task).order_by(Task.due_date, Task.due_time)
    today = date.today()
    if filter == "completed":
        query = query.where(Task.completed.is_(True))
    elif filter == "overdue":
        query = query.where(Task.completed.is_(False), Task.due_date < today)
    elif filter == "upcoming":
        query = query.where(Task.completed.is_(False), Task.due_date >= today)
    return db.scalars(query).all()


@router.post("/tasks", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    ensure_subject(db, payload.subject_id)
    task = Task(**payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/tasks/{task_id}", response_model=TaskRead)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    values = payload.model_dump(exclude_unset=True)
    ensure_subject(db, values.get("subject_id"))
    for key, value in values.items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()


@router.get("/events", response_model=list[EventRead])
def list_events(month: str | None = Query(default=None, pattern=r"^\d{4}-\d{2}$"), db: Session = Depends(get_db)):
    query = select(CalendarEvent).order_by(CalendarEvent.event_date, CalendarEvent.event_time)
    if month:
        start = datetime.strptime(month, "%Y-%m").date()
        end = date(start.year + (start.month == 12), 1 if start.month == 12 else start.month + 1, 1)
        query = query.where(CalendarEvent.event_date >= start, CalendarEvent.event_date < end)
    return db.scalars(query).all()


@router.post("/events", response_model=EventRead, status_code=status.HTTP_201_CREATED)
def create_event(payload: EventCreate, db: Session = Depends(get_db)):
    ensure_subject(db, payload.subject_id)
    event = CalendarEvent(**payload.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.patch("/events/{event_id}", response_model=EventRead)
def update_event(event_id: int, payload: EventUpdate, db: Session = Depends(get_db)):
    event = db.get(CalendarEvent, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Calendar event not found")
    values = payload.model_dump(exclude_unset=True)
    ensure_subject(db, values.get("subject_id"))
    for key, value in values.items():
        setattr(event, key, value)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: int, db: Session = Depends(get_db)):
    event = db.get(CalendarEvent, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Calendar event not found")
    db.delete(event)
    db.commit()
