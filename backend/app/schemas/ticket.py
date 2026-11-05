from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.utils.timeutil import UTCDateTime


Priority = Literal["low", "mid", "high", "urgent"]
Status = Literal["new", "doing", "done", "closed"]


# ---------- Ticket ----------
class TicketCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    type: str
    description: str = Field(min_length=1)
    location: str = Field(min_length=1, max_length=150)
    priority: Priority = "mid"


class ResolveIn(BaseModel):
    cause: str = Field(min_length=1, max_length=500)
    action: str = Field(min_length=1, max_length=500)
    outcome: str = Field(min_length=1, max_length=300)


class AssignIn(BaseModel):
    tech_id: int


class RateIn(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=500)


class TextIn(BaseModel):
    text: str = Field(min_length=1, max_length=500)


class PersonRef(BaseModel):
    id: int
    name: str


class HistoryOut(BaseModel):
    actor: str
    action: str
    created_at: UTCDateTime


class CommentOut(BaseModel):
    id: int
    user_id: int
    by: str
    role: str
    text: str
    created_at: UTCDateTime


class AttachmentOut(BaseModel):
    id: int
    file_name: str
    mime_type: str | None
    size_bytes: int | None
    url: str


class TicketOut(BaseModel):
    id: int
    code: str
    title: str
    type: str
    description: str
    location: str
    priority: Priority
    status: Status
    creator: PersonRef
    tech: PersonRef | None
    created_at: UTCDateTime
    assigned_at: UTCDateTime | None
    started_at: UTCDateTime | None
    resolved_at: UTCDateTime | None
    closed_at: UTCDateTime | None
    deadline: UTCDateTime
    overdue: bool
    rating: int | None
    rating_comment: str | None


class TicketDetail(TicketOut):
    result_cause: str | None = None
    result_action: str | None = None
    result_outcome: str | None = None
    history: list[HistoryOut] = []
    comments: list[CommentOut] = []
    attachments: list[AttachmentOut] = []
