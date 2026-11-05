import re
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.middleware.permissions import admin_only, current_user, require_roles
from app.models import Attachment, Ticket, User
from app.schemas import AssignIn, RateIn, ResolveIn, TextIn, TicketCreate, TicketDetail, TicketOut
from app.services import ticket_service as svc
from app.services.common import get_settings

router = APIRouter(prefix="/api", tags=["Phiếu sự cố"])
ALLOWED = {"image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf", "text/plain"}


def _detail(db: Session, t: Ticket) -> TicketDetail:
    db.refresh(t)
    return svc.to_detail(t, get_settings(db))


@router.get("/tickets", response_model=list[TicketOut])
def list_tickets(status: str | None = None, type: str | None = None, priority: str | None = None, tech_id: int | None = None,
                 q: str | None = None, u: User = Depends(current_user), db: Session = Depends(get_db)):
    sla = get_settings(db)
    return [svc.to_out(t, sla) for t in svc.list_tickets(db, u, status, type, priority, tech_id, q)]


@router.post("/tickets", response_model=TicketDetail, status_code=201)
def create_ticket(d: TicketCreate, u: User = Depends(require_roles("user")), db: Session = Depends(get_db)):
    return _detail(db, svc.create_ticket(db, u, d))


@router.get("/tickets/{tid}", response_model=TicketDetail)
def get_ticket(tid: int, u: User = Depends(current_user), db: Session = Depends(get_db)):
    return _detail(db, svc.get_ticket(db, tid, u))


@router.post("/tickets/{tid}/start", response_model=TicketDetail)
def start(tid: int, u: User = Depends(current_user), db: Session = Depends(get_db)):
    t = svc.get_ticket(db, tid, u); svc.start(db, u, t); return _detail(db, t)


@router.post("/tickets/{tid}/resolve", response_model=TicketDetail)
def resolve(tid: int, d: ResolveIn, u: User = Depends(current_user), db: Session = Depends(get_db)):
    t = svc.get_ticket(db, tid, u); svc.resolve(db, u, t, d); return _detail(db, t)


@router.post("/tickets/{tid}/rate", response_model=TicketDetail)
def rate(tid: int, d: RateIn, u: User = Depends(current_user), db: Session = Depends(get_db)):
    t = svc.get_ticket(db, tid, u); svc.rate(db, u, t, d); return _detail(db, t)


@router.post("/tickets/{tid}/reopen", response_model=TicketDetail)
def reopen(tid: int, u: User = Depends(current_user), db: Session = Depends(get_db)):
    t = svc.get_ticket(db, tid, u); svc.reopen(db, u, t); return _detail(db, t)


@router.post("/tickets/{tid}/close", response_model=TicketDetail)
def close(tid: int, u: User = Depends(admin_only), db: Session = Depends(get_db)):
    t = svc.get_ticket(db, tid, u); svc.close(db, u, t); return _detail(db, t)


@router.post("/tickets/{tid}/note", response_model=TicketDetail)
def note(tid: int, d: TextIn, u: User = Depends(current_user), db: Session = Depends(get_db)):
    t = svc.get_ticket(db, tid, u); svc.add_note(db, u, t, d.text); return _detail(db, t)


@router.post("/tickets/{tid}/comments", response_model=TicketDetail)
def comment(tid: int, d: TextIn, u: User = Depends(current_user), db: Session = Depends(get_db)):
    t = svc.get_ticket(db, tid, u); svc.add_comment(db, u, t, d.text); return _detail(db, t)


# ---------- Tep dinh kem ----------
@router.post("/tickets/{tid}/attachments", response_model=TicketDetail, status_code=201)
async def upload(tid: int, files: list[UploadFile] = File(...), u: User = Depends(current_user), db: Session = Depends(get_db)):
    t = svc.get_ticket(db, tid, u)
    if u.role not in ("admin", "user", "tech"):
        raise HTTPException(403, "Không có quyền")
    if len(t.attachments) + len(files) > 6:
        raise HTTPException(422, "Tối đa 6 tệp đính kèm cho mỗi phiếu")
    root = Path(settings.UPLOAD_DIR) / str(t.id)
    root.mkdir(parents=True, exist_ok=True)
    for f in files:
        data = await f.read()
        if f.content_type not in ALLOWED:
            raise HTTPException(415, f"Định dạng không được hỗ trợ: {f.filename}")
        if len(data) > settings.MAX_UPLOAD_MB * 1024 * 1024:
            raise HTTPException(413, f"Tệp quá lớn (tối đa {settings.MAX_UPLOAD_MB} MB): {f.filename}")
        safe = re.sub(r"[^\w.\-]+", "_", Path(f.filename or "file").name)[:100] or "file"
        path = root / f"{uuid.uuid4().hex}_{safe}"
        path.write_bytes(data)
        db.add(Attachment(ticket_id=t.id, file_name=Path(f.filename or safe).name[:255], mime_type=f.content_type, size_bytes=len(data), storage_path=str(path)))
    db.commit()
    return _detail(db, t)


@router.get("/attachments/{aid}")
def download(aid: int, u: User = Depends(current_user), db: Session = Depends(get_db)):
    a = db.get(Attachment, aid)
    if not a:
        raise HTTPException(404, "Không tìm thấy tệp")
    svc.get_ticket(db, a.ticket_id, u)  # kiem tra quyen xem phieu
    p = Path(a.storage_path)
    if not p.is_file():
        raise HTTPException(404, "Tệp không còn trên máy chủ")
    return FileResponse(p, media_type=a.mime_type or "application/octet-stream", filename=a.file_name)
