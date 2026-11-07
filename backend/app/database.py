from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import StaticPool

from app.config import settings

_url = settings.DATABASE_URL
_kw: dict = {"pool_pre_ping": True}
if _url.startswith("sqlite"):  # chi dung cho kiem thu
    _kw = {"connect_args": {"check_same_thread": False}}
    if ":memory:" in _url or _url.rstrip("/") in ("sqlite:", "sqlite://"):
        _kw["poolclass"] = StaticPool

engine = create_engine(_url, **_kw)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
IS_MSSQL = engine.dialect.name == "mssql"


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
