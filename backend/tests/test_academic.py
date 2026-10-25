from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.session import Base, get_db
from app.main import app


@pytest.fixture()
def client(tmp_path):
    engine = create_engine(f"sqlite:///{tmp_path / 'test.db'}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)

    def override():
        db = session()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_subject_attendance_and_persistence(client):
    subject = client.post("/api/subjects", json={"name": "Algorithms", "attendance_target": 75}).json()
    subject_id = subject["id"]
    for status in ("attended", "attended", "missed", "cancelled"):
        response = client.post(f"/api/subjects/{subject_id}/attendance", json={"session_date": "2026-10-25", "status": status})
        assert response.status_code == 201
    summary = client.get(f"/api/subjects/{subject_id}/attendance/summary").json()
    assert summary["held"] == 3
    assert summary["percentage"] == pytest.approx(66.67)
    assert summary["classes_to_target"] == 1
    assert client.get("/api/subjects").json()[0]["name"] == "Algorithms"


def test_task_filters_and_event_month(client):
    subject_id = client.post("/api/subjects", json={"name": "Networks"}).json()["id"]
    today = date.today()
    client.post("/api/tasks", json={"title": "Past", "due_date": str(today - timedelta(days=1)), "subject_id": subject_id})
    client.post("/api/tasks", json={"title": "Done", "due_date": str(today), "completed": True})
    client.post("/api/tasks", json={"title": "Soon", "due_date": str(today + timedelta(days=1))})
    assert [task["title"] for task in client.get("/api/tasks?filter=overdue").json()] == ["Past"]
    assert [task["title"] for task in client.get("/api/tasks?filter=completed").json()] == ["Done"]
    event = client.post("/api/events", json={"title": "Leap day", "event_date": "2028-02-29"}).json()
    assert event["event_date"] == "2028-02-29"
    assert client.get("/api/events?month=2028-02").json()[0]["id"] == event["id"]


def test_invalid_relationship_is_rejected(client):
    response = client.post("/api/tasks", json={"title": "Bad", "due_date": "2026-10-25", "subject_id": 999})
    assert response.status_code == 404
