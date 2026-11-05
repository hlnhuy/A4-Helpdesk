from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.utils.security import decode_token

bearer = HTTPBearer(auto_error=False)


def current_user(cred: HTTPAuthorizationCredentials | None = Depends(bearer), db: Session = Depends(get_db)) -> User:
    data = decode_token(cred.credentials) if cred else None
    user = db.get(User, int(data["sub"])) if data else None
    if not user:
        raise HTTPException(401, "Chưa đăng nhập hoặc phiên đã hết hạn", headers={"WWW-Authenticate": "Bearer"})
    if not user.is_active:
        raise HTTPException(403, "Tài khoản đã bị khóa, vui lòng liên hệ Admin")
    return user


def require_roles(*roles: str):
    def dep(user: User = Depends(current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(403, "Bạn không có quyền thực hiện thao tác này")
        return user
    return dep


admin_only = require_roles("admin")
