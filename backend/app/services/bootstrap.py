"""Khoi tao du lieu cot loi (chuyen mon, cau hinh, Admin dau tien) va du lieu demo tuy chon."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Setting, Skill, User
from app.services.common import DEFAULTS
from app.utils.security import hash_password

SKILLS = ["Wi-Fi", "Internet", "Mạng LAN", "Thiết bị", "Khác"]
DEMO = [  # username, ho ten, email, vai tro, chuyen mon
    ("ktv1", "Nguyễn Văn Hùng", "hung.nv@a4.edu.vn", "tech", ["Wi-Fi", "Internet", "Mạng LAN"]),
    ("ktv2", "Trần Thị Mai", "mai.tt@a4.edu.vn", "tech", ["Thiết bị", "Khác"]),
    ("ktv3", "Lê Quốc Bảo", "bao.lq@a4.edu.vn", "tech", ["Mạng LAN", "Thiết bị", "Wi-Fi"]),
    ("user1", "Phạm Minh Anh", "anh.pm@a4.edu.vn", "user", []),
    ("user2", "Đỗ Thu Hà", "ha.dt@a4.edu.vn", "user", []),
]


def ensure_core(db: Session) -> None:
    have = {s.name for s in db.scalars(select(Skill))}
    for n in SKILLS:
        if n not in have:
            db.add(Skill(name=n))
    if not db.scalar(select(User).where(User.role == "admin")):
        db.add(User(username=settings.ADMIN_USERNAME.lower(), email=settings.ADMIN_EMAIL.lower(), full_name=settings.ADMIN_NAME,
                    password_hash=hash_password(settings.ADMIN_PASSWORD), role="admin"))
    db.flush()
    missing = {k: v for k, v in DEFAULTS.items() if db.get(Setting, k) is None}
    for k, v in missing.items():
        db.add(Setting(key=k, value=v))
    db.commit()


def seed_demo(db: Session, password: str = "123456") -> int:
    skills = {s.name: s for s in db.scalars(select(Skill))}
    n = 0
    for un, name, email, role, sk in DEMO:
        if db.scalar(select(User).where(User.username == un)):
            continue
        db.add(User(username=un, email=email, full_name=name, role=role, password_hash=hash_password(password), skills=[skills[s] for s in sk]))
        n += 1
    db.commit()
    return n
