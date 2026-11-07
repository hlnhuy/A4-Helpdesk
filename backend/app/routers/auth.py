from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.permissions import current_user
from app.models import User
from app.schemas import ForgotIn, LoginIn, PasswordChange, ProfileUpdate, TokenOut, UserOut
from app.services import auth_service
from app.services.auth_service import user_out
from app.utils.security import create_token

router = APIRouter(prefix="/api/auth", tags=["Đăng nhập"])


@router.post("/login", response_model=TokenOut)
def login(d: LoginIn, db: Session = Depends(get_db)):
    u = auth_service.authenticate(db, d.username, d.password)
    return TokenOut(access_token=create_token(u.id, u.role), user=user_out(u))


@router.get("/me", response_model=UserOut)
def me(u: User = Depends(current_user)):
    return user_out(u)


@router.put("/profile", response_model=UserOut)
def update_profile(d: ProfileUpdate, u: User = Depends(current_user), db: Session = Depends(get_db)):
    from fastapi import HTTPException
    if d.full_name is not None:
        u.full_name = d.full_name
    if d.phone is not None:
        u.phone = d.phone
    if d.is_available is not None:
        if u.role != "tech":
            raise HTTPException(403, "Chỉ kỹ thuật viên mới có trạng thái sẵn sàng")
        u.is_available = d.is_available
    db.commit()
    return user_out(u)


@router.post("/change-password")
def change_password(d: PasswordChange, u: User = Depends(current_user), db: Session = Depends(get_db)):
    auth_service.change_password(db, u, d.old_password, d.new_password)
    return {"ok": True}


@router.post("/forgot-password")
def forgot_password(d: ForgotIn, db: Session = Depends(get_db)):
    auth_service.issue_temp_password(db, d.email)
    return {"message": "Nếu email tồn tại trong hệ thống, mật khẩu tạm thời đã được gửi."}
