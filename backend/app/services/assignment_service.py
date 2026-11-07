"""Tu dong phan cong ky thuat vien.

Quy tac (giong ban demo):
  1. Chi xet KTV dang hoat dong, dang san sang va co chuyen mon dung loai su co.
  2. Chon nguoi co it phieu dang mo (new/doing) nhat.
  3. Hoa nhau -> nguoi duoc giao gan day nhat nam sau (giao lau nhat duoc uu tien).

Tren SQL Server, truy van khoa cac dong KTV bang UPDLOCK + HOLDLOCK trong cung transaction,
nen hai phieu tao cung luc se duoc phan cong tuan tu, khong bi giao trung mot nguoi.
"""
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import IS_MSSQL
from app.models import Ticket, User, user_skills
from app.services.common import add_history, notify, notify_admins
from app.utils.timeutil import utcnow

OPEN = ("new", "doing")


def open_load(db: Session, tech_id: int) -> int:
    return db.scalar(select(func.count()).select_from(Ticket).where(Ticket.tech_id == tech_id, Ticket.status.in_(OPEN))) or 0


def last_assigned(db: Session, tech_id: int) -> datetime:
    return db.scalar(select(func.max(Ticket.assigned_at)).where(Ticket.tech_id == tech_id)) or datetime.min


def candidates(db: Session, skill_id: int) -> list[User]:
    stmt = (
        select(User)
        .join(user_skills, user_skills.c.user_id == User.id)
        .where(User.role == "tech", User.is_active == True, User.is_available == True, user_skills.c.skill_id == skill_id)  # noqa: E712
    )
    if IS_MSSQL:
        stmt = stmt.with_hint(User.__table__, "WITH (UPDLOCK, HOLDLOCK)", "mssql")
    return list(db.scalars(stmt).unique())


def pick_tech(db: Session, skill_id: int) -> User | None:
    c = candidates(db, skill_id)
    if not c:
        return None
    return sorted(c, key=lambda u: (open_load(db, u.id), last_assigned(db, u.id), u.id))[0]


def auto_assign(db: Session, t: Ticket) -> bool:
    k = pick_tech(db, t.type_id)
    if not k:
        add_history(db, t, "Hệ thống", "Chưa có kỹ thuật viên phù hợp — chờ Admin phân công")
        notify_admins(db, f"Phiếu {t.code} chưa có KTV phù hợp, cần phân công thủ công", t)
        return False
    load = open_load(db, k.id)
    t.tech_id = k.id
    t.assigned_at = utcnow()
    add_history(db, t, "Hệ thống", f"Tự động phân công cho {k.full_name} (đang xử lý {load} phiếu)")
    notify(db, k.id, f"Bạn được giao phiếu {t.code}: {t.title}", t)
    notify(db, t.creator_id, f"Phiếu {t.code} đã được giao cho {k.full_name}", t)
    return True
