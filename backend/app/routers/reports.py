"""Bao cao: xuat CSV danh sach phieu theo bo loc, tong hop, nhat ky he thong."""
import csv
import io
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.permissions import admin_only
from app.models import AuditLog, Ticket, User
from app.services import report_service as rs

router = APIRouter(prefix="/api/reports", tags=["Báo cáo"])


@router.get("/tickets.csv")
def tickets_csv(date_from: str | None = None, date_to: str | None = None, status: str | None = None, type: str | None = None,
                tech_id: int | None = None, _: User = Depends(admin_only), db: Session = Depends(get_db)):
    """Xuat CSV (mo duoc bang Excel, co BOM de hien dung tieng Viet)."""
    rows = rs.filtered(db, date_from, date_to, status, type, tech_id)
    out = io.StringIO()
    w = csv.writer(out)
    w.writerow(["Mã", "Tiêu đề", "Loại", "Ưu tiên", "Trạng thái", "Người gửi", "KTV", "Vị trí", "Tạo lúc (UTC)", "Giải quyết lúc (UTC)", "Đánh giá"])
    for t in rows:
        w.writerow([t.code, t.title, t.type.name, t.priority, t.status, t.creator.full_name, t.tech.full_name if t.tech else "",
                    t.location, t.created_at.isoformat(sep=" "), t.resolved_at.isoformat(sep=" ") if t.resolved_at else "", t.rating or ""])
    return Response("\ufeff" + out.getvalue(), media_type="text/csv; charset=utf-8", headers={"Content-Disposition": 'attachment; filename="bao-cao-su-co.csv"'})


@router.get("/summary")
def summary(date_from: str | None = None, date_to: str | None = None, _: User = Depends(admin_only), db: Session = Depends(get_db)):
    return rs.summary(db, date_from, date_to)


@router.get("/logs")
def logs(limit: int = 100, _: User = Depends(admin_only), db: Session = Depends(get_db)):
    rows = db.scalars(select(AuditLog).order_by(AuditLog.id.desc()).limit(max(1, min(limit, 500))))
    return [{"id": r.id, "message": r.message, "created_at": r.created_at.isoformat() + "Z"} for r in rows]
