from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.utils.timeutil import UTCDateTime
from app.schemas.user import UserOut


# ---------- Auth / User ----------
class LoginIn(BaseModel):
    username: str = Field(min_length=1)  # ma tai khoan hoac email
    password: str = Field(min_length=1)


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class PasswordChange(BaseModel):
    old_password: str
    new_password: str = Field(min_length=6, max_length=72)


class ForgotIn(BaseModel):
    email: EmailStr


class ProfileUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=120)
    phone: str | None = None
    is_available: bool | None = None
