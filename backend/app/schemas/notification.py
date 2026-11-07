from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.utils.timeutil import UTCDateTime


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    ticket_id: int | None
    message: str
    is_read: bool
    created_at: UTCDateTime
