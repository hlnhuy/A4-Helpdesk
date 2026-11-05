"""Quan ly tai khoan, chuyen mon (loai su co), yeu cau cap tai khoan."""
from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import AccountRequest, Skill, Ticket, User
from app.services.common import audit
from app.utils.security import hash_password


def get_or_404(db: Session, uid: int) -> User:
    x = db.get(User, uid)
    if not x:
        raise HTTPException(404, "Không tìm thấy tài khoản")
    return x


def resolve_skills(db: Session, names: list[str]) -> list[Skill]:
    found = list(db.scalars(select(Skill).where(Skill.name.in_(names)).order_by(Skill.id))) if names else []
    if len(found) != len(set(names)):
        raise HTTPException(422, "Có chuyên môn không tồn tại")
    return found


def email_taken(db: Session, email: str) -> bool:
    return db.scalar(select(User).where(func.lower(User.email) == email.lower())) is not None


def username_taken(db: Session, username: str) -> bool:
    return db.scalar(select(User).where(func.lower(User.username) == username.lower())) is not None


def skill_in_use(db: Session, skill: Skill) -> bool:
    return bool(db.scalar(select(func.count()).select_from(Ticket).where(Ticket.type_id == skill.id)))


def approve_request(db: Session, admin: User, r: AccountRequest) -> User:
    if r.status != "pending":
        raise HTTPException(409, "Yêu cầu đã được xử lý")
    if email_taken(db, r.email):
        raise HTTPException(409, "Email đã có tài khoản")
    base = "".join(c for c in r.email.split("@")[0].lower() if c.isalnum() or c in "._-") or "user"
    un, i = base, 1
    while username_taken(db, un):
        un, i = f"{base}{i}", i + 1
    x = User(username=un, email=r.email, full_name=r.full_name, role=r.role, password_hash=hash_password("123456"))
    db.add(x)
    r.status = "approved"
    audit(db, admin, f"Cấp tài khoản {un} từ yêu cầu của {r.full_name}")
    db.commit()
    return x
