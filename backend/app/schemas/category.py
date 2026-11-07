from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.utils.timeutil import UTCDateTime


class SkillIn(BaseModel):
    name: str = Field(min_length=1, max_length=60)
