from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.utils.timeutil import UTCDateTime


class SettingsIO(BaseModel):
    sla_low: int = Field(ge=1, le=720)
    sla_mid: int = Field(ge=1, le=720)
    sla_high: int = Field(ge=1, le=720)
    sla_urgent: int = Field(ge=1, le=720)
    auto_assign: bool
