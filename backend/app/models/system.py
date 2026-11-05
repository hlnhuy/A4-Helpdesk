from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, SmallInteger, Table, Unicode, UnicodeText
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.utils.timeutil import utcnow


"""Cau hinh he thong, nhat ky, yeu cau cap tai khoan."""


class AccountRequest(Base):
    __tablename__ = "account_requests"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    full_name: Mapped[str] = mapped_column(Unicode(120))
    email: Mapped[str] = mapped_column(Unicode(150))
    role: Mapped[str] = mapped_column(Unicode(20), default="user")
    note: Mapped[str | None] = mapped_column(Unicode(500), nullable=True)
    status: Mapped[str] = mapped_column(Unicode(20), default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class Setting(Base):
    __tablename__ = "settings"
    key: Mapped[str] = mapped_column("key", Unicode(60), primary_key=True)
    value: Mapped[str] = mapped_column(Unicode(500))


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    message: Mapped[str] = mapped_column(Unicode(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
