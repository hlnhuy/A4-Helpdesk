from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, SmallInteger, Table, Unicode, UnicodeText
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.utils.timeutil import utcnow


"""Loai su co = chuyen mon cua ky thuat vien (Wi-Fi, Internet, Mang LAN, Thiet bi, Khac)."""


class Skill(Base):
    __tablename__ = "skills"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(Unicode(60), unique=True)
