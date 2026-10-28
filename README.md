# A4 - Hệ thống tiếp nhận và xử lý sự cố mạng (Helpdesk)

Bộ khung ban đầu cho đề tài A4 – Hệ thống tiếp nhận và xử lý sự cố mạng. Hệ thống hỗ trợ người dùng gửi yêu cầu hỗ trợ kỹ thuật, theo dõi tiến độ và giúp nhân viên kỹ thuật tiếp nhận, phân công và xử lý sự cố mạng trong trường học.

## Công nghệ dự kiến

- Frontend: React + Vite + HTML + CSS
- Backend: Python + FastAPI
- Database: MySQL
- Xác thực và phân quyền: Admin, Kỹ thuật viên, Người sử dụng
- Quản lý mã nguồn: Git + GitHub

## Chức năng dự kiến

- Admin tạo, cấp và quản lý tài khoản người dùng.
- Sinh viên, giảng viên và nhân viên đăng nhập bằng tài khoản được cấp.
- Người sử dụng tạo phiếu báo sự cố mạng và theo dõi trạng thái xử lý.
- Kỹ thuật viên xem phiếu được phân công, cập nhật tiến độ và kết quả xử lý.
- Admin quản lý danh mục sự cố, phân công kỹ thuật viên và xem báo cáo thống kê.

## Chạy backend

1. Cài đặt Python 3.10 trở lên.
2. Mở terminal tại thư mục `backend`.
3. Tạo môi trường ảo:

   ```bash
   python -m venv .venv
   ```

4. Kích hoạt trên Windows PowerShell:

   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```

5. Cài đặt thư viện:

   ```bash
   pip install -r requirements.txt
   ```

6. Khởi chạy API:

   ```bash
   fastapi dev app/main.py
   ```

7. Mở `http://127.0.0.1:8000/docs` để xem tài liệu API.

## Chạy frontend

Cài đặt Node.js trước. Mở terminal tại thư mục `frontend`, sau đó chạy:

```bash
npm install
npm run dev
```

Vite sẽ hiển thị địa chỉ website trong terminal, thường là `http://localhost:5173`.

## Cơ sở dữ liệu

1. Cài đặt và khởi động MySQL.
2. Sử dụng phpMyAdmin hoặc MySQL Workbench để thực thi file `database/schema.sql`.
3. Tạo file `.env` trong thư mục `backend` dựa trên `.env.example`.
4. Cấu hình thông tin kết nối MySQL trong `.env`.
5. Chỉ sử dụng dữ liệu mẫu trong giai đoạn phát triển.

## Cấu trúc

- `frontend/`: giao diện React + Vite.
- `backend/`: API và nghiệp vụ FastAPI.
- `database/`: cấu trúc cơ sở dữ liệu và dữ liệu mẫu MySQL.
- `storage/`: nơi lưu tệp đính kèm và log.
- `docs/`: tài liệu yêu cầu, thiết kế và hướng dẫn sử dụng.
- `tests/`: các bài kiểm thử.

## Quy trình xử lý sự cố

Mới tiếp nhận → Đang xử lý → Đã giải quyết → Đã đóng.

Admin cấp tài khoản, người sử dụng gửi phiếu, kỹ thuật viên tiếp nhận và cập nhật kết quả xử lý.

## Lưu ý

- Đây là bộ khung phát triển ban đầu, chưa phải sản phẩm hoàn chỉnh.
- Các chức năng đăng nhập, cấp tài khoản, phân quyền, xử lý phiếu và kết nối MySQL sẽ được triển khai theo từng giai đoạn.
- Không đưa mật khẩu, API key, khóa bí mật hoặc dữ liệu cá nhân thật của nhà trường lên GitHub.
- Việc kết nối dữ liệu thật của trường chỉ thực hiện khi được cấp quyền phù hợp.
