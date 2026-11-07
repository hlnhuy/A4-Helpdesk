# A4 - Hệ thống tiếp nhận và xử lý sự cố mạng (Helpdesk)

Bộ khung ban đầu cho đề tài A4 – Hệ thống tiếp nhận và xử lý sự cố mạng. Hệ thống hỗ trợ người dùng gửi yêu cầu hỗ trợ kỹ thuật, theo dõi tiến độ và giúp nhân viên kỹ thuật tiếp nhận, phân công và xử lý sự cố mạng trong trường học.

## Công nghệ dự kiến

- Frontend: React + Vite + HTML + CSS
- Backend: Python + FastAPI
- Database: SQL Server (SQLAlchemy + ODBC Driver 18)
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

   ```powershell
   python -m venv .venv
   ```

4. Kích hoạt trên Windows PowerShell:

   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```

5. Cài đặt thư viện:

   ```bash
   python -m pip install -r requirements.txt
   ```

6. Khởi chạy API từ thư mục `backend`:

   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```

7. Mở `http://127.0.0.1:8000/docs` để xem tài liệu API.

## Chạy frontend

Cài đặt Node.js 18 trở lên. Chạy các lệnh sau từ thư mục gốc của dự án:

```powershell
npm install
npm run dev --workspace=frontend -- --host 0.0.0.0
```

Vite sẽ hiển thị địa chỉ website trong terminal, thường là `http://localhost:5173`.
Muốn quét QR bằng điện thoại, mở website từ địa chỉ IP LAN của máy chạy Vite (cùng mạng Wi-Fi). Không dùng `localhost` trên điện thoại. Để tạo bản build production, chạy `npm run build`. Nếu muốn chạy trực tiếp trong thư mục `frontend`, cũng có thể chạy `npm install` và `npm run dev -- --host 0.0.0.0` tại đó.

### Tài khoản và dữ liệu frontend

Đăng nhập, yêu cầu cấp tài khoản, quản lý tài khoản Admin, hồ sơ và đổi mật khẩu dùng API backend và SQL Server. Trước khi đăng nhập, cần chạy backend và cấu hình `frontend/.env` theo `frontend/.env.example` nếu API không ở `http://127.0.0.1:8000/api`.

Tài khoản Admin ban đầu được tạo từ cấu hình `ADMIN_USERNAME` và `ADMIN_PASSWORD` trong `backend/.env`; hãy đổi mật khẩu mặc định trước khi dùng. Các tài khoản do Admin tạo và yêu cầu cấp tài khoản được lưu trong SQL Server. Để tạo tài khoản demo backend tùy chọn, chỉ chạy `python -m app.seed` với database phát triển/test:

Các chức năng phiếu, phân công, báo cáo, check-in và một số dữ liệu giao diện khác vẫn là bản demo dùng `localStorage`; chúng chưa đồng bộ với SQL Server/API.

Với bản demo phiếu, người dùng không chọn mức độ ưu tiên; phiếu mới hiển thị “Chưa duyệt” và chưa được giao cho KTV. Admin duyệt mức ưu tiên, chọn KTV phụ trách đã Check in có chuyên môn phù hợp, có thể chọn thêm một KTV hỗ trợ thuộc bất kỳ chuyên môn nào, rồi bấm “Lưu” để giao phiếu. KTV đang xử lý công việc khác được đánh dấu “Bận” nhưng vẫn có thể được chọn hỗ trợ. Hệ thống gợi ý KTV tự động; Admin vẫn cần lưu phân công. Dữ liệu phiếu demo chỉ tồn tại trong trình duyệt.

Trang giới thiệu hiển thị một mã QR dùng chung, mở trang đăng nhập rồi chuyển người dùng đến biểu mẫu tạo phiếu. Mã QR không tự điền vị trí.

Báo cáo tính thời gian chờ phân công, phản hồi và xử lý từ các mốc thời gian có trong dữ liệu. Check in/Check out yêu cầu mở camera và chụp ảnh xác nhận, nhưng ảnh chụp camera không được lưu và bản demo không nhận diện/xác minh danh tính. Chỉ KTV đã Check in mới được nhận phiếu hoặc bắt đầu/tiếp tục xử lý. Camera trên thiết bị khác cần website chạy trong secure context (HTTPS; localhost được trình duyệt cho phép). Đây vẫn là bản demo frontend: dữ liệu phiếu chỉ ở trình duyệt và chưa được xác thực, đồng bộ hoặc lưu qua backend.

Các ô thống kê trên Dashboard Admin mở danh sách phiếu tương ứng khi được chọn. Admin/KTV cập nhật phiếu từ danh sách hoặc trang chi tiết; giao diện demo cũng có trao đổi và đánh giá phiếu, yêu cầu xử lý lại, gợi ý KTV và kho FAQ.

## Cơ sở dữ liệu

Backend dùng SQL Server Express và ODBC Driver 18. Hướng dẫn tạo database, cấu hình kết nối và nạp dữ liệu ban đầu nằm trong [database/README.md](./database/README.md). Cấu hình kết nối backend trong `backend/.env`.

## Cấu trúc

- `frontend/`: giao diện React + Vite.
- `backend/`: API và nghiệp vụ FastAPI.
- `database/`: schema và dữ liệu khởi tạo SQL Server.
- `storage/`: nơi lưu tệp đính kèm và log.
- `docs/`: tài liệu yêu cầu, thiết kế và hướng dẫn sử dụng.
- `tests/`: các bài kiểm thử.

## Quy trình xử lý sự cố

Mới tiếp nhận → Đang xử lý → Đã giải quyết → Đã đóng.

Admin cấp tài khoản, người sử dụng gửi phiếu, kỹ thuật viên tiếp nhận và cập nhật kết quả xử lý.

## Lưu ý

- Luồng tài khoản giao tiếp với API backend; các luồng phiếu và báo cáo chưa kết nối API.
- Backend FastAPI lưu dữ liệu qua SQL Server; cấu hình backend riêng trước khi chạy.
- Không đưa mật khẩu, API key, khóa bí mật hoặc dữ liệu cá nhân thật của nhà trường lên GitHub.
- Việc kết nối dữ liệu thật của trường chỉ thực hiện khi được cấp quyền phù hợp.
