"""Thong ke cho Dashboard (moi vai tro chi thay so lieu trong pham vi cua minh)."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.permissions import admin_only, current_user
from app.models import User
from app.services import report_service as stats

router = APIRouter(prefix="/api", tags=["Dashboard"])


@router.get("/dashboard/overview")
def s_overview(u: User = Depends(current_user), db: Session = Depends(get_db)):
    return stats.overview(db, u)


@router.get("/dashboard/by-type")
def s_type(u: User = Depends(current_user), db: Session = Depends(get_db)):
    return stats.by_type(db, u)


@router.get("/dashboard/by-tech")
def s_tech(_: User = Depends(admin_only), db: Session = Depends(get_db)):
    return stats.by_tech(db)


@router.get("/dashboard/daily")
def s_daily(days: int = 14, u: User = Depends(current_user), db: Session = Depends(get_db)):
    return stats.daily(db, u, max(1, min(days, 90)))
