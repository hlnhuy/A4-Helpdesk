"""Nghiep vu phieu su co: tao, phan cong, doi trang thai, danh gia, dinh kem."""
from datetime import timedelta

from fastapi import HTTPException
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models import Skill, Ticket, TicketComment, User
from app.schemas import (AttachmentOut, CommentOut, HistoryOut, PersonRef, RateIn, ResolveIn, TicketCreate, TicketDetail,
                         TicketOut)
from app.services.assignment_service import OPEN, auto_assign
from app.services.common import add_history, audit, get_settings, notify, notify_admins
from app.utils.timeutil import utcnow


def err(code: int, msg: str):
    raise HTTPException(status_code=code, detail=msg)


# ---------- Truy van & quyen xem ----------
def can_view(u: User, t: Ticket) -> bool:
    return u.role == "admin" or (u.role == "user" and t.creator_id == u.id) or (u.role == "tech" and t.tech_id == u.id)


def get_ticket(db: Session, tid: int, u: User) -> Ticket:
    t = db.get(Ticket, tid)
    if not t or not can_view(u, t):
        err(404, "Phiếu không tồn tại hoặc bạn không có quyền xem")
    return t


def list_tickets(db: Session, u: User, status=None, type_=None, priority=None, tech_id=None, q=None, limit=300) -> list[Ticket]:
    stmt = select(Ticket).join(Skill, Skill.id == Ticket.type_id)
    if u.role == "user":
        stmt = stmt.where(Ticket.creator_id == u.id)
    elif u.role == "tech":
        stmt = stmt.where(Ticket.tech_id == u.id)
    if status:
        stmt = stmt.where(Ticket.status == status)
    if type_:
        stmt = stmt.where(Skill.name == type_)
    if priority:
        stmt = stmt.where(Ticket.priority == priority)
    if tech_id and u.role == "admin":
        stmt = stmt.where(Ticket.tech_id == tech_id)
    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where(or_(Ticket.title.like(like), Ticket.location.like(like), Ticket.description.like(like)))
    return list(db.scalars(stmt.order_by(Ticket.created_at.desc(), Ticket.id.desc()).limit(limit)).unique())


# ---------- Chuyen doi sang schema tra ra ----------
def deadline_of(t: Ticket, sla: dict):
    return t.created_at + timedelta(hours=sla[f"sla_{t.priority}"])


def is_overdue(t: Ticket, sla: dict) -> bool:
    dl = deadline_of(t, sla)
    return utcnow() > dl if t.status in OPEN else bool(t.resolved_at and t.resolved_at > dl)


def to_out(t: Ticket, sla: dict) -> TicketOut:
    return TicketOut(
        id=t.id, code=t.code, title=t.title, type=t.type.name, description=t.description, location=t.location,
        priority=t.priority, status=t.status, creator=PersonRef(id=t.creator.id, name=t.creator.full_name),
        tech=PersonRef(id=t.tech.id, name=t.tech.full_name) if t.tech else None, created_at=t.created_at,
        assigned_at=t.assigned_at, started_at=t.started_at, resolved_at=t.resolved_at, closed_at=t.closed_at,
        deadline=deadline_of(t, sla), overdue=is_overdue(t, sla), rating=t.rating, rating_comment=t.rating_comment,
    )


def to_detail(t: Ticket, sla: dict) -> TicketDetail:
    base = to_out(t, sla).model_dump()
    return TicketDetail(
        **base, result_cause=t.result_cause, result_action=t.result_action, result_outcome=t.result_outcome,
        history=[HistoryOut(actor=h.actor, action=h.action, created_at=h.created_at) for h in t.history],
        comments=[CommentOut(id=c.id, user_id=c.user_id, by=c.user.full_name, role=c.user.role, text=c.body, created_at=c.created_at) for c in t.comments],
        attachments=[AttachmentOut(id=a.id, file_name=a.file_name, mime_type=a.mime_type, size_bytes=a.size_bytes, url=f"/api/attachments/{a.id}") for a in t.attachments],
    )


# ---------- Thao tac nghiep vu ----------
def create_ticket(db: Session, u: User, d: TicketCreate) -> Ticket:
    skill = db.scalar(select(Skill).where(Skill.name == d.type))
    if not skill:
        err(422, "Loại sự cố không hợp lệ")
    t = Ticket(title=d.title.strip(), type_id=skill.id, description=d.description.strip(), location=d.location.strip(),
               priority=d.priority, status="new", creator_id=u.id)
    t.type, t.creator = skill, u
    db.add(t)
    db.flush()
    add_history(db, t, u.full_name, "Tạo phiếu sự cố")
    if get_settings(db)["auto_assign"]:
        auto_assign(db, t)
        db.flush()
        t.tech = db.get(User, t.tech_id) if t.tech_id else None
    else:
        add_history(db, t, "Hệ thống", "Tự động phân công đang tắt — chờ Admin phân công")
        notify_admins(db, f"Phiếu {t.code} chờ phân công thủ công", t)
    audit(db, u, f"{u.full_name} tạo phiếu {t.code}")
    db.commit()
    return t


def assign(db: Session, admin: User, t: Ticket, tech_id: int) -> None:
    if t.status not in OPEN:
        err(409, "Chỉ phân công được phiếu đang mở")
    k = db.get(User, tech_id)
    if not k or k.role != "tech" or not k.is_active:
        err(422, "Kỹ thuật viên không hợp lệ")
    old = t.tech
    t.tech, t.tech_id, t.assigned_at = k, k.id, utcnow()
    add_history(db, t, admin.full_name, (f"Đổi người phụ trách {old.full_name} → " if old else "Phân công thủ công cho ") + k.full_name)
    notify(db, k.id, f"Bạn được giao phiếu {t.code}: {t.title}", t)
    notify(db, t.creator_id, f"Phiếu {t.code} được giao cho {k.full_name}", t)
    if old and old.id != k.id:
        notify(db, old.id, f"Phiếu {t.code} đã chuyển sang {k.full_name}", t)
    audit(db, admin, f"Phân công {t.code} cho {k.full_name}")
    db.commit()


def reassign_auto(db: Session, admin: User, t: Ticket) -> bool:
    if t.status not in OPEN:
        err(409, "Chỉ phân công được phiếu đang mở")
    old_id, old = t.tech_id, t.tech
    t.tech_id, t.tech = None, None
    ok = auto_assign(db, t)
    if ok:
        t.tech = db.get(User, t.tech_id)
    else:
        t.tech_id, t.tech = old_id, old
    audit(db, admin, f"Tự động phân công {t.code}")
    db.commit()
    return ok


def start(db: Session, u: User, t: Ticket) -> None:
    if u.role != "tech" or t.tech_id != u.id:
        err(403, "Chỉ kỹ thuật viên được giao phiếu mới được tiếp nhận")
    if t.status != "new":
        err(409, "Phiếu không ở trạng thái Mới tiếp nhận")
    t.status, t.started_at = "doing", utcnow()
    add_history(db, t, u.full_name, "Tiếp nhận và bắt đầu xử lý")
    notify(db, t.creator_id, f"Phiếu {t.code} đang được {u.full_name} xử lý", t)
    audit(db, u, f"{u.full_name} bắt đầu xử lý {t.code}")
    db.commit()


def resolve(db: Session, u: User, t: Ticket, d: ResolveIn) -> None:
    if u.role != "tech" or t.tech_id != u.id:
        err(403, "Chỉ kỹ thuật viên phụ trách mới được giải quyết phiếu")
    if t.status != "doing":
        err(409, "Chỉ giải quyết được phiếu đang xử lý")
    t.result_cause, t.result_action, t.result_outcome = d.cause, d.action, d.outcome
    t.status, t.resolved_at = "done", utcnow()
    add_history(db, t, u.full_name, f"Đã giải quyết: {d.action}")
    notify(db, t.creator_id, f"Phiếu {t.code} đã được giải quyết, vui lòng xác nhận", t)
    notify_admins(db, f"{u.full_name} đã giải quyết {t.code}", t)
    audit(db, u, f"{u.full_name} giải quyết {t.code}")
    db.commit()


def rate(db: Session, u: User, t: Ticket, d: RateIn) -> None:
    if u.role != "user" or t.creator_id != u.id:
        err(403, "Chỉ người gửi phiếu mới được xác nhận và đánh giá")
    if t.status not in ("done", "closed") or t.rating is not None:
        err(409, "Phiếu chưa thể đánh giá hoặc đã được đánh giá")
    t.rating, t.rating_comment = d.rating, d.comment
    if t.status != "closed":
        t.status, t.closed_at = "closed", utcnow()
    add_history(db, t, u.full_name, f"Xác nhận hoàn tất, đánh giá {d.rating}/5 sao")
    if t.tech_id:
        notify(db, t.tech_id, f"Phiếu {t.code} nhận đánh giá {d.rating}/5 sao", t)
    db.commit()


def reopen(db: Session, u: User, t: Ticket) -> None:
    if u.role != "user" or t.creator_id != u.id:
        err(403, "Chỉ người gửi phiếu mới được yêu cầu xử lý lại")
    if t.status != "done":
        err(409, "Chỉ yêu cầu xử lý lại khi phiếu ở trạng thái Đã giải quyết")
    t.status, t.resolved_at = "doing", None
    t.result_cause = t.result_action = t.result_outcome = None
    add_history(db, t, u.full_name, "Yêu cầu xử lý lại")
    notify(db, t.tech_id, f"Phiếu {t.code} được yêu cầu xử lý lại", t)
    db.commit()


def close(db: Session, admin: User, t: Ticket) -> None:
    if t.status == "closed":
        err(409, "Phiếu đã đóng")
    t.status, t.closed_at = "closed", utcnow()
    add_history(db, t, admin.full_name, "Admin đóng phiếu")
    notify(db, t.creator_id, f"Phiếu {t.code} đã được đóng", t)
    audit(db, admin, f"Admin đóng {t.code}")
    db.commit()


def add_note(db: Session, u: User, t: Ticket, text: str) -> None:
    if not (u.role == "admin" or (u.role == "tech" and t.tech_id == u.id)):
        err(403, "Bạn không có quyền ghi chú vào phiếu này")
    add_history(db, t, u.full_name, f"Ghi chú: {text}")
    if u.role == "tech":
        notify(db, t.creator_id, f"Cập nhật tiến độ {t.code}", t)
    db.commit()


def add_comment(db: Session, u: User, t: Ticket, text: str) -> None:
    db.add(TicketComment(ticket_id=t.id, user_id=u.id, body=text.strip()))
    for uid in {t.creator_id, t.tech_id} - {u.id, None}:
        notify(db, uid, f"{u.full_name} đã trao đổi ở phiếu {t.code}: \"{text[:60]}\"", t)
    db.commit()
    db.refresh(t)
