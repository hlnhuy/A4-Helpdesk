# A4 Helpdesk - Backend (FastAPI + SQL Server)

## Cai dat (Windows, PowerShell)

Mo PowerShell trong thu muc `backend`:

```
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env   # roi sua JWT_SECRET, ADMIN_PASSWORD
```

Neu da tao `.venv` o thu muc goc du an, co the kich hoat moi truong do tu `backend` bang lenh `..\.venv\Scripts\Activate.ps1`. Luon chay `python -m pip install -r requirements.txt` trong thu muc `backend` de cai dependencies vao dung moi truong dang kich hoat.

Can cai san **ODBC Driver 18 for SQL Server** va da chay `database/schema.sql` trong SSMS.

## Chay

Chay cac lenh sau tu thu muc `backend`, sau khi da cau hinh `.env` va SQL Server:

```
uvicorn app.main:app --reload --port 8000
python -m app.seed            # (tuy chon) tao KTV/nguoi dung demo, mat khau 123456
```

`app.seed` ghi cac tai khoan demo vao database duoc chi dinh boi `DATABASE_URL`. Chi chay voi database phat trien/test hoac ban sao da an danh; khong chay voi database production. Neu chua cau hinh SQL Server va chua co ban sao du lieu, bo qua lenh nay.

- Tai lieu API tu dong: http://localhost:8000/docs
- Lan chay dau tu tao Admin theo `.env` (mac dinh `admin` / `Admin@12345`) - **hay doi ngay**.

## Kiem thu

Tests dung SQLite trong bo nho, khong ket noi hoac thay doi database SQL Server:

```
python -m pytest -q
```

## Cau truc
- `routers/` endpoint HTTP - `services/` nghiep vu (tu dong phan cong, quy trinh phieu, thong ke)
- `middleware/auth.py` JWT + phan quyen vai tro - `models/` ORM - `schemas/` kieu du lieu vao/ra
