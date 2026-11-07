from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.utils.timeutil import UTCDateTime


Role = Literal["admin", "tech", "user"]


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    email: str
    full_name: str
    phone: str | None = None
    role: Role
    is_active: bool
    is_available: bool
    skills: list[str] = []


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50, pattern=r"^[A-Za-z0-9._-]+$")
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=120)
    phone: str | None = None
    role: Role = "user"
    password: str = Field(default="123456", min_length=6, max_length=72)
    skills: list[str] = []


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = Field(default=None, min_length=1, max_length=120)
    phone: str | None = None
    role: Role | None = None
    skills: list[str] | None = None


class AccountRequestIn(BaseModel):
    full_name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    role: Literal["user", "tech"] = "user"
    note: str | None = Field(default=None, max_length=500)


class AccountRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    full_name: str
    email: str
    role: str
    note: str | None
    status: str
    created_at: UTCDateTime
