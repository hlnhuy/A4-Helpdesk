from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.routers import assignments, auth, categories, dashboard, notifications, reports, settings as settings_router, tickets, users
from app.services.bootstrap import ensure_core


@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings.AUTO_CREATE_TABLES:  # chi dung khi test / SQLite; voi SQL Server hay chay database/schema.sql
        Base.metadata.create_all(engine)
    with SessionLocal() as db:
        ensure_core(db)
    yield


app = FastAPI(title="A4 Helpdesk API", version="1.0.0", description="Hệ thống báo và xử lý sự cố mạng — Trường A4", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_list, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

for r in (auth.router, users.router, categories.router, tickets.router, assignments.router, notifications.router, dashboard.router, reports.router, settings_router.router):
    app.include_router(r)


@app.get("/api/health", tags=["Hệ thống"])
def health():
    return {"status": "ok"}
