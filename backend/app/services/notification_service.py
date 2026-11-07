"""Thong bao trong ung dung (chuong thong bao). Muon gui them email/Zalo/Telegram thi mo rong tai day."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Notification, Ticket, User


def notify(db: Session, user_id: int | None, text: str, ticket: Ticket | None = None) -> None:
    if user_id:
        db.add(Notification(user_id=user_id, message=text[:500], ticket_id=ticket.id if ticket else None))


def notify_admins(db: Session, text: str, ticket: Ticket | None = None) -> None:
    for a in db.scalars(select(User).where(User.role == "admin", User.is_active == True)):  # noqa: E712
        notify(db, a.id, text, ticket)
