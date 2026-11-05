from datetime import datetime, timezone
from typing import Annotated

from pydantic import PlainSerializer


def utcnow() -> datetime:
    """Gio UTC khong mang tzinfo - dung thong nhat cho toan bo cot DATETIME."""
    return datetime.now(timezone.utc).replace(tzinfo=None, microsecond=0)


def _iso(d: datetime | None):
    return None if d is None else d.isoformat() + "Z"


# Kieu datetime khi tra ra JSON: luon co hau to Z de React hieu la gio UTC
UTCDateTime = Annotated[datetime, PlainSerializer(_iso, return_type=str | None, when_used="json")]
