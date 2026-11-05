"""Nap du lieu demo (KTV + nguoi dung mau):  python -m app.seed"""
from app.database import SessionLocal
from app.services.bootstrap import ensure_core, seed_demo

if __name__ == "__main__":
    with SessionLocal() as db:
        ensure_core(db)
        print(f"Da tao {seed_demo(db)} tai khoan demo (mat khau 123456): ktv1, ktv2, ktv3, user1, user2")
