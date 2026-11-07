import os, sys
os.environ["DATABASE_URL"] = "sqlite://"          # SQLite trong bo nho, chi de kiem thu
os.environ["AUTO_CREATE_TABLES"] = "true"
os.environ["UPLOAD_DIR"] = os.path.join(os.path.dirname(__file__), "_uploads")
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pytest
from fastapi.testclient import TestClient

from app.database import Base, SessionLocal, engine
from app.main import app
from app.services.bootstrap import ensure_core, seed_demo


@pytest.fixture()
def client():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        ensure_core(db)
        seed_demo(db)
    with TestClient(app) as c:
        yield c


def login(client, username, password="123456"):
    r = client.post("/api/auth/login", json={"username": username, "password": password})
    assert r.status_code == 200, r.text
    return {"Authorization": "Bearer " + r.json()["access_token"]}


@pytest.fixture()
def H(client):
    return {"admin": login(client, "admin", "Admin@12345"), "ktv1": login(client, "ktv1"), "ktv2": login(client, "ktv2"),
            "ktv3": login(client, "ktv3"), "user1": login(client, "user1"), "user2": login(client, "user2")}


def new_ticket(client, H, who="user1", **kw):
    d = {"title": "Wi-Fi A4-201 không vào được", "type": "Wi-Fi", "description": "Mất kết nối", "location": "A4-201", "priority": "high", **kw}
    r = client.post("/api/tickets", json=d, headers=H[who])
    assert r.status_code == 201, r.text
    return r.json()
