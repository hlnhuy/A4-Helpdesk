from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, SmallInteger, Table, Unicode, UnicodeText
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.utils.timeutil import utcnow
from app.models.category import Skill
from app.models.user import User


class Ticket(Base):
    __tablename__ = "tickets"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(Unicode(200))
    type_id: Mapped[int] = mapped_column(ForeignKey("skills.id"))
    description: Mapped[str] = mapped_column(UnicodeText)
    location: Mapped[str] = mapped_column(Unicode(150))
    priority: Mapped[str] = mapped_column(Unicode(10))
    status: Mapped[str] = mapped_column(Unicode(10), default="new")
    creator_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    tech_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    rating: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    rating_comment: Mapped[str | None] = mapped_column(Unicode(500), nullable=True)
    result_cause: Mapped[str | None] = mapped_column(Unicode(500), nullable=True)
    result_action: Mapped[str | None] = mapped_column(Unicode(500), nullable=True)
    result_outcome: Mapped[str | None] = mapped_column(Unicode(300), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    assigned_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    type: Mapped[Skill] = relationship(lazy="joined")
    creator: Mapped[User] = relationship(foreign_keys=[creator_id], lazy="joined")
    tech: Mapped[User | None] = relationship(foreign_keys=[tech_id], lazy="joined")
    history: Mapped[list["TicketHistory"]] = relationship(order_by="TicketHistory.id", cascade="all, delete-orphan", lazy="selectin")
    comments: Mapped[list["TicketComment"]] = relationship(order_by="TicketComment.id", cascade="all, delete-orphan", lazy="selectin")
    attachments: Mapped[list["Attachment"]] = relationship(order_by="Attachment.id", cascade="all, delete-orphan", lazy="selectin")

    @property
    def code(self) -> str:  # khop cot tinh toan 'code' trong schema.sql
        return f"HD-{self.id:04d}"


class TicketComment(Base):
    __tablename__ = "ticket_comments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ticket_id: Mapped[int] = mapped_column(ForeignKey("tickets.id", ondelete="CASCADE"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    body: Mapped[str] = mapped_column(Unicode(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    user: Mapped[User] = relationship(lazy="joined")
