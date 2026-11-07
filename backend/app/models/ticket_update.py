from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, SmallInteger, Table, Unicode, UnicodeText
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.utils.timeutil import utcnow


"""Lich su xu ly cua phieu (moi dong = mot lan cap nhat / phan cong / doi trang thai)."""


class TicketHistory(Base):
    __tablename__ = "ticket_history"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ticket_id: Mapped[int] = mapped_column(ForeignKey("tickets.id", ondelete="CASCADE"))
    actor: Mapped[str] = mapped_column(Unicode(120))
    action: Mapped[str] = mapped_column(Unicode(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
