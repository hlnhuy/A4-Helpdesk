from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.permissions import current_user
from app.models import Notification, User
from app.schemas import NotificationOut

router = APIRouter(prefix="/api", tags=["Thông báo"])


@router.get("/notifications", response_model=list[NotificationOut])
def notifications(u: User = Depends(current_user), db: Session = Depends(get_db)):
    return list(db.scalars(select(Notification).where(Notification.user_id == u.id).order_by(Notification.id.desc()).limit(50)))


@router.get("/notifications/unread-count")
def unread(u: User = Depends(current_user), db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.user_id == u.id, Notification.is_read == False).count()  # noqa: E712
    return {"count": n}


@router.post("/notifications/read-all")
def read_all(u: User = Depends(current_user), db: Session = Depends(get_db)):
    db.execute(update(Notification).where(Notification.user_id == u.id).values(is_read=True))
    db.commit()
    return {"ok": True}


@router.post("/notifications/{nid}/read")
def read_one(nid: int, u: User = Depends(current_user), db: Session = Depends(get_db)):
    n = db.get(Notification, nid)
    if not n or n.user_id != u.id:
        raise HTTPException(404, "Không tìm thấy thông báo")
    n.is_read = True
    db.commit()
    return {"ok": True}
