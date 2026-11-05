"""Loai su co (= chuyen mon cua ky thuat vien)."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.permissions import admin_only, current_user
from app.models import Skill, User
from app.schemas import SkillIn
from app.services import user_service as svc
from app.services.common import audit

router = APIRouter(prefix="/api/categories", tags=["Loại sự cố"])


@router.get("", response_model=list[str])
def list_categories(_: User = Depends(current_user), db: Session = Depends(get_db)):
    return [s.name for s in db.scalars(select(Skill).order_by(Skill.id))]


@router.post("", status_code=201)
def add_category(d: SkillIn, admin: User = Depends(admin_only), db: Session = Depends(get_db)):
    name = d.name.strip()
    if db.scalar(select(Skill).where(Skill.name == name)):
        raise HTTPException(409, "Chuyên môn đã tồn tại")
    db.add(Skill(name=name))
    audit(db, admin, f"Thêm loại sự cố {name}")
    db.commit()
    return {"name": name}


@router.delete("/{name}")
def delete_category(name: str, admin: User = Depends(admin_only), db: Session = Depends(get_db)):
    s = db.scalar(select(Skill).where(Skill.name == name))
    if not s:
        raise HTTPException(404, "Không tìm thấy loại sự cố")
    if svc.skill_in_use(db, s):
        raise HTTPException(409, "Không thể xóa: đã có phiếu thuộc loại này")
    db.delete(s)
    audit(db, admin, f"Xóa loại sự cố {name}")
    db.commit()
    return {"ok": True}
