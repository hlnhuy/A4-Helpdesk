"""Ham dung chung: cau hinh he thong, thong bao, lich su, nhat ky."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AuditLog, Setting, Ticket, TicketHistory, User
from app.services.notification_service import notify, notify_admins  # noqa: F401  (re-export)

DEFAULTS = {"sla_low": "24", "sla_mid": "8", "sla_high": "4", "sla_urgent": "1", "auto_assign": "1"}


def get_settings(db: Session) -> dict:
    rows = {s.key: s.value for s in db.scalars(select(Setting))}
    v = {**DEFAULTS, **rows}
    return {
        "sla_low": int(v["sla_low"]), "sla_mid": int(v["sla_mid"]), "sla_high": int(v["sla_high"]),
        "sla_urgent": int(v["sla_urgent"]), "auto_assign": v["auto_assign"] in ("1", "true", "True"),
    }


def save_settings(db: Session, data: dict) -> None:
    for k, val in data.items():
        sval = ("1" if val else "0") if isinstance(val, bool) else str(val)
        row = db.get(Setting, k)
        if row:
            row.value = sval
        else:
            db.add(Setting(key=k, value=sval))


def sla_hours(db: Session, priority: str) -> int:
    return get_settings(db)[f"sla_{priority}"]


def add_history(db: Session, t: Ticket, actor: str, text: str) -> None:
    t.history.append(TicketHistory(actor=actor, action=text[:500]))


def audit(db: Session, user: User | None, text: str) -> None:
    db.add(AuditLog(user_id=user.id if user else None, message=text[:500]))
