"""Phan cong ky thuat vien: thu cong, tu dong cho 1 phieu, tu dong cho tat ca phieu chua co nguoi."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.permissions import admin_only
from app.models import Ticket, User
from app.schemas import AssignIn, TicketDetail
from app.services import ticket_service as svc
from app.services.common import get_settings

router = APIRouter(prefix="/api", tags=["Phân công"])


def _detail(db: Session, t: Ticket) -> TicketDetail:
    db.refresh(t)
    return svc.to_detail(t, get_settings(db))


@router.post("/tickets/{tid}/assign", response_model=TicketDetail)
def assign(tid: int, d: AssignIn, u: User = Depends(admin_only), db: Session = Depends(get_db)):
    t = svc.get_ticket(db, tid, u); svc.assign(db, u, t, d.tech_id); return _detail(db, t)


@router.post("/tickets/{tid}/auto-assign", response_model=TicketDetail)
def auto_assign(tid: int, u: User = Depends(admin_only), db: Session = Depends(get_db)):
    t = svc.get_ticket(db, tid, u)
    if not svc.reassign_auto(db, u, t):
        raise HTTPException(409, "Không có kỹ thuật viên phù hợp, giữ nguyên người phụ trách")
    return _detail(db, t)


@router.post("/tickets/auto-assign-all")
def auto_assign_all(u: User = Depends(admin_only), db: Session = Depends(get_db)):
    n = 0
    for t in svc.list_tickets(db, u, status=None):
        if t.tech_id is None and t.status in ("new", "doing") and svc.reassign_auto(db, u, t):
            n += 1
    return {"assigned": n}
