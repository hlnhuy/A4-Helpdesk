from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.permissions import admin_only, current_user
from app.models import User
from app.schemas import SettingsIO
from app.services.common import audit, get_settings, save_settings

router = APIRouter(prefix="/api", tags=["Cấu hình"])


@router.get("/settings", response_model=SettingsIO)
def get_cfg(_: User = Depends(current_user), db: Session = Depends(get_db)):
    return get_settings(db)


@router.put("/settings", response_model=SettingsIO)
def put_cfg(d: SettingsIO, admin: User = Depends(admin_only), db: Session = Depends(get_db)):
    save_settings(db, d.model_dump())
    audit(db, admin, "Admin cập nhật cấu hình hệ thống")
    db.commit()
    return get_settings(db)
