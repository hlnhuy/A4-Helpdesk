"""Xac thuc: dang nhap, mat khau tam, doi mat khau."""
import secrets

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import User
from app.schemas import UserOut
from app.services.common import audit
from app.services.mailer import send_mail
from app.utils.security import hash_password, verify_password


def user_out(u: User) -> UserOut:
    return UserOut(id=u.id, username=u.username, email=u.email, full_name=u.full_name, phone=u.phone, role=u.role,
                   is_active=u.is_active, is_available=u.is_available, skills=[s.name for s in u.skills])


def authenticate(db: Session, username: str, password: str) -> User:
    k = username.strip().lower()
    u = db.scalar(select(User).where(func.lower(User.username) == k)) or db.scalar(select(User).where(func.lower(User.email) == k))
    if not u or not verify_password(password, u.password_hash):
        raise HTTPException(401, "Sai tài khoản hoặc mật khẩu")
    if not u.is_active:
        raise HTTPException(403, "Tài khoản đã bị khóa, vui lòng liên hệ Admin")
    audit(db, u, f"{u.full_name} đăng nhập")
    db.commit()
    return u


def change_password(db: Session, u: User, old: str, new: str) -> None:
    if not verify_password(old, u.password_hash):
        raise HTTPException(400, "Mật khẩu hiện tại không đúng")
    u.password_hash = hash_password(new)
    audit(db, u, f"{u.full_name} đổi mật khẩu")
    db.commit()


def issue_temp_password(db: Session, email: str) -> None:
    """Khong tiet lo email co ton tai hay khong: luon thanh cong ve phia nguoi goi."""
    u = db.scalar(select(User).where(func.lower(User.email) == email.lower()))
    if u and u.is_active:
        tmp = secrets.token_urlsafe(6)
        u.password_hash = hash_password(tmp)
        audit(db, u, f"Cấp mật khẩu tạm cho {u.username}")
        db.commit()
        send_mail(u.email, "[A4 Helpdesk] Mật khẩu tạm thời", f"Mật khẩu tạm của bạn: {tmp}\nHãy đăng nhập và đổi mật khẩu ngay.")
