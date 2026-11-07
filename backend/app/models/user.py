from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, SmallInteger, Table, Unicode, UnicodeText
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.utils.timeutil import utcnow
from app.models.category import Skill


"""Tai khoan nguoi dung + bang noi user_skills (chuyen mon cua KTV)."""

user_skills = Table(
    "user_skills", Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(Unicode(50), unique=True)
    email: Mapped[str] = mapped_column(Unicode(150), unique=True)
    password_hash: Mapped[str] = mapped_column(Unicode(255))
    full_name: Mapped[str] = mapped_column(Unicode(120))
    phone: Mapped[str | None] = mapped_column(Unicode(30), nullable=True)
    role: Mapped[str] = mapped_column(Unicode(20))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    skills: Mapped[list[Skill]] = relationship(secondary=user_skills, lazy="selectin", order_by=Skill.id)
