"""Quan ly tai khoan (Admin) va yeu cau cap tai khoan."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.permissions import admin_only
from app.models import AccountRequest, User
from app.schemas import AccountRequestIn, AccountRequestOut, UserCreate, UserOut, UserUpdate
from app.services import user_service as svc
from app.services.auth_service import user_out
from app.services.common import audit, notify_admins
from app.utils.security import hash_password

router = APIRouter(prefix="/api", tags=["Tài khoản"])


@router.get("/users", response_model=list[UserOut])
def list_users(role: str | None = None, _: User = Depends(admin_only), db: Session = Depends(get_db)):
    stmt = select(User).order_by(User.id)
    if role:
        stmt = stmt.where(User.role == role)
    return [user_out(x) for x in db.scalars(stmt)]


@router.post("/users", response_model=UserOut, status_code=201)
def create_user(d: UserCreate, admin: User = Depends(admin_only), db: Session = Depends(get_db)):
    if svc.username_taken(db, d.username):
        raise HTTPException(409, "Mã tài khoản đã tồn tại")
    if svc.email_taken(db, d.email):
        raise HTTPException(409, "Email đã tồn tại")
    x = User(username=d.username.lower(), email=d.email.lower(), full_name=d.full_name, phone=d.phone, role=d.role,
             password_hash=hash_password(d.password), skills=svc.resolve_skills(db, d.skills) if d.role == "tech" else [])
    db.add(x)
    audit(db, admin, f"Tạo tài khoản {x.username}")
    db.commit()
    return user_out(x)


@router.put("/users/{uid}", response_model=UserOut)
def update_user(uid: int, d: UserUpdate, admin: User = Depends(admin_only), db: Session = Depends(get_db)):
    x = svc.get_or_404(db, uid)
    if d.email and d.email.lower() != x.email and svc.email_taken(db, d.email):
        raise HTTPException(409, "Email đã tồn tại")
    if d.role and d.role != x.role and x.id == admin.id:
        raise HTTPException(400, "Không thể tự đổi vai trò của chính mình")
    if d.email: x.email = d.email.lower()
    if d.full_name: x.full_name = d.full_name
    if d.phone is not None: x.phone = d.phone
    if d.role: x.role = d.role
    if d.skills is not None or d.role:
        x.skills = svc.resolve_skills(db, d.skills if d.skills is not None else [s.name for s in x.skills]) if x.role == "tech" else []
    audit(db, admin, f"Sửa tài khoản {x.username}")
    db.commit()
    return user_out(x)


@router.post("/users/{uid}/toggle-lock", response_model=UserOut)
def toggle_lock(uid: int, admin: User = Depends(admin_only), db: Session = Depends(get_db)):
    x = svc.get_or_404(db, uid)
    if x.id == admin.id:
        raise HTTPException(400, "Không thể tự khóa tài khoản của chính mình")
    x.is_active = not x.is_active
    audit(db, admin, f"{'Mở khóa' if x.is_active else 'Khóa'} {x.username}")
    db.commit()
    return user_out(x)


@router.post("/users/{uid}/reset-password")
def reset_password(uid: int, admin: User = Depends(admin_only), db: Session = Depends(get_db)):
    x = svc.get_or_404(db, uid)
    x.password_hash = hash_password("123456")
    audit(db, admin, f"Đặt lại mật khẩu {x.username}")
    db.commit()
    return {"message": f"Mật khẩu của {x.full_name} đã đặt lại thành 123456"}


# ---------- Yeu cau cap tai khoan ----------
@router.post("/account-requests", response_model=AccountRequestOut, status_code=201)
def create_request(d: AccountRequestIn, db: Session = Depends(get_db)):
    email = d.email.lower()
    existing_user = svc.email_taken(db, email)
    existing_request = db.scalar(
        select(AccountRequest).where(
            AccountRequest.status == "pending",
            func.lower(AccountRequest.email) == email,
        )
    )
    if existing_user or existing_request:
        raise HTTPException(409, "Email đã có tài khoản hoặc đang chờ duyệt")
    r = AccountRequest(full_name=d.full_name, email=email, role=d.role, note=d.note)
    db.add(r)
    db.flush()
    notify_admins(db, f"Yêu cầu cấp tài khoản mới từ {d.full_name}")
    db.commit()
    return r


@router.get("/account-requests", response_model=list[AccountRequestOut])
def list_requests(_: User = Depends(admin_only), db: Session = Depends(get_db)):
    return list(db.scalars(select(AccountRequest).order_by(AccountRequest.id.desc())))


def _req(db: Session, rid: int) -> AccountRequest:
    r = db.get(AccountRequest, rid)
    if not r:
        raise HTTPException(404, "Không tìm thấy yêu cầu")
    return r


@router.post("/account-requests/{rid}/approve", response_model=UserOut)
def approve_request(rid: int, admin: User = Depends(admin_only), db: Session = Depends(get_db)):
    return user_out(svc.approve_request(db, admin, _req(db, rid)))


@router.post("/account-requests/{rid}/reject")
def reject_request(rid: int, admin: User = Depends(admin_only), db: Session = Depends(get_db)):
    r = _req(db, rid)
    if r.status != "pending":
        raise HTTPException(409, "Yêu cầu đã được xử lý")
    r.status = "rejected"
    audit(db, admin, f"Từ chối yêu cầu của {r.full_name}")
    db.commit()
    return {"ok": True}
