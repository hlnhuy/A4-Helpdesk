"""Thong ke: tinh bang Python tren du lieu da loc de chay giong nhau tren moi CSDL."""
from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Skill, Ticket, User
from app.services.assignment_service import OPEN
from app.services.common import get_settings
from app.services.ticket_service import is_overdue
from app.utils.timeutil import utcnow


def _avg(xs):
    xs = [x for x in xs if x is not None]
    return round(sum(xs) / len(xs)) if xs else None


def _secs(a, b):
    return (b - a).total_seconds() if a and b else None


def scoped(db: Session, u: User) -> list[Ticket]:
    stmt = select(Ticket)
    if u.role == "user":
        stmt = stmt.where(Ticket.creator_id == u.id)
    elif u.role == "tech":
        stmt = stmt.where(Ticket.tech_id == u.id)
    return list(db.scalars(stmt).unique())


def overview(db: Session, u: User) -> dict:
    L, sla = scoped(db, u), get_settings(db)
    rated = [t.rating for t in L if t.rating]
    return {
        "total": len(L),
        "by_status": {s: sum(1 for t in L if t.status == s) for s in ("new", "doing", "done", "closed")},
        "open": sum(1 for t in L if t.status in OPEN),
        "overdue_open": sum(1 for t in L if t.status in OPEN and is_overdue(t, sla)),
        "overdue_total": sum(1 for t in L if is_overdue(t, sla)),
        "avg_wait_seconds": _avg([_secs(t.created_at, t.assigned_at) for t in L]),        # cho phan cong
        "avg_response_seconds": _avg([_secs(t.created_at, t.started_at) for t in L]),      # phan hoi
        "avg_resolve_seconds": _avg([_secs(t.started_at or t.created_at, t.resolved_at) for t in L]),  # xu ly
        "avg_rating": round(sum(rated) / len(rated), 2) if rated else None,
        "rating_count": len(rated),
    }


def by_type(db: Session, u: User) -> list[dict]:
    L = scoped(db, u)
    return [{"type": s.name, "count": sum(1 for t in L if t.type_id == s.id)} for s in db.scalars(select(Skill).order_by(Skill.id))]


def by_tech(db: Session) -> list[dict]:
    L, sla = scoped_all(db), get_settings(db)
    out = []
    for k in db.scalars(select(User).where(User.role == "tech").order_by(User.id)):
        m = [t for t in L if t.tech_id == k.id]
        r = [t.rating for t in m if t.rating]
        out.append({
            "tech_id": k.id, "name": k.full_name, "open": sum(1 for t in m if t.status in OPEN),
            "resolved": sum(1 for t in m if t.status in ("done", "closed")),
            "avg_response_seconds": _avg([_secs(t.created_at, t.started_at) for t in m]),
            "avg_resolve_seconds": _avg([_secs(t.started_at or t.created_at, t.resolved_at) for t in m]),
            "avg_rating": round(sum(r) / len(r), 2) if r else None, "overdue": sum(1 for t in m if is_overdue(t, sla)),
        })
    return out


def scoped_all(db: Session) -> list[Ticket]:
    return list(db.scalars(select(Ticket)).unique())


def daily(db: Session, u: User, days: int = 14) -> list[dict]:
    L, today = scoped(db, u), utcnow().date()
    out = []
    for i in range(days - 1, -1, -1):
        d = today - timedelta(days=i)
        out.append({"date": d.isoformat(), "count": sum(1 for t in L if t.created_at.date() == d)})
    return out


def _parse(d: str | None, end: bool = False):
    from datetime import datetime
    if not d:
        return None
    x = datetime.fromisoformat(d[:10])
    return x + timedelta(days=1) if end else x


def filtered(db: Session, date_from=None, date_to=None, status=None, type_=None, tech_id=None) -> list[Ticket]:
    a, b = _parse(date_from), _parse(date_to, True)
    stmt = select(Ticket).join(Skill, Skill.id == Ticket.type_id).order_by(Ticket.created_at.desc())
    if a: stmt = stmt.where(Ticket.created_at >= a)
    if b: stmt = stmt.where(Ticket.created_at < b)
    if status: stmt = stmt.where(Ticket.status == status)
    if type_: stmt = stmt.where(Skill.name == type_)
    if tech_id: stmt = stmt.where(Ticket.tech_id == tech_id)
    return list(db.scalars(stmt).unique())


def summary(db: Session, date_from=None, date_to=None) -> dict:
    L, sla = filtered(db, date_from, date_to), get_settings(db)
    rated = [t.rating for t in L if t.rating]
    return {
        "total": len(L), "overdue": sum(1 for t in L if is_overdue(t, sla)),
        "avg_response_seconds": _avg([_secs(t.created_at, t.started_at) for t in L]),
        "avg_resolve_seconds": _avg([_secs(t.started_at or t.created_at, t.resolved_at) for t in L]),
        "avg_rating": round(sum(rated) / len(rated), 2) if rated else None,
        "by_status": {s: sum(1 for t in L if t.status == s) for s in ("new", "doing", "done", "closed")},
        "by_type": {s.name: sum(1 for t in L if t.type_id == s.id) for s in db.scalars(select(Skill).order_by(Skill.id))},
    }
