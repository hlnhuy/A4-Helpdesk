# A4 Helpdesk - Backend (FastAPI + SQL Server)

## Cai dat (Windows, PowerShell, trong thu muc backend)
```
py -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env        # roi sua JWT_SECRET, ADMIN_PASSWORD
```
Can cai san **ODBC Driver 18 for SQL Server** va da chay `database/schema.sql` trong SSMS.

## Chay
```
uvicorn app.main:app --reload --port 8000
python -m app.seed            # (tuy chon) tao KTV/nguoi dung demo, mat khau 123456
```
- Tai lieu API tu dong: http://localhost:8000/docs
- Lan chay dau tu tao Admin theo `.env` (mac dinh `admin` / `Admin@12345`) - **hay doi ngay**.

## Kiem thu
```
pytest -q        # 17 ca, chay tren SQLite trong bo nho, khong can SQL Server
```

## Cau truc
- `routers/` endpoint HTTP - `services/` nghiep vu (tu dong phan cong, quy trinh phieu, thong ke)
- `middleware/auth.py` JWT + phan quyen vai tro - `models/` ORM - `schemas/` kieu du lieu vao/ra
