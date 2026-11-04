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

Cài đặt Node.js trước. Chạy các lệnh sau từ thư mục gốc của dự án:

```powershell
npm install
npm run dev --workspace=frontend -- --host 0.0.0.0
```

Vite sẽ hiển thị địa chỉ website trong terminal, thường là `http://localhost:5173`.
Muốn quét QR bằng điện thoại, mở website từ địa chỉ IP LAN của máy chạy Vite (cùng mạng Wi-Fi). Không dùng `localhost` trên điện thoại. Để tạo bản build production, chạy `npm run build`. Nếu muốn chạy trực tiếp trong thư mục `frontend`, cũng có thể chạy `npm install` và `npm run dev -- --host 0.0.0.0` tại đó.

### Tài khoản demo frontend

Frontend hiện chạy bằng dữ liệu demo lưu trong `localStorage` của trình duyệt; tài khoản demo không xác thực với backend:

| Vai trò | Mã tài khoản | Mật khẩu |
| --- | --- | --- |
| Quản trị viên | `admin` | `admin123` |
| Kỹ thuật viên | `ktv1` | `ktv123` |
| Người dùng | `user1` | `user123` |

Tạo phiếu, cập nhật trạng thái, quản lý tài khoản/chuyên môn và báo cáo đều thao tác trên dữ liệu demo của trình duyệt. Người dùng không chọn mức độ ưu tiên; phiếu mới hiển thị “Chưa duyệt” và chưa được giao cho KTV. Admin duyệt mức ưu tiên, chọn KTV phụ trách đã Check in có chuyên môn phù hợp, có thể chọn thêm một KTV hỗ trợ thuộc bất kỳ chuyên môn nào, rồi bấm “Lưu” để giao phiếu. KTV đang xử lý công việc khác được đánh dấu “Bận” nhưng vẫn có thể được chọn hỗ trợ. Có thể bật gợi ý KTV tự động; hệ thống chọn sẵn người phụ trách nhưng Admin vẫn cần lưu phân công. Người dùng có thể gửi yêu cầu cấp tài khoản, yêu cầu đặt lại mật khẩu và đổi mật khẩu; yêu cầu được lưu trong dữ liệu demo để Admin xử lý. Xóa dữ liệu trang web trong trình duyệt sẽ khôi phục bộ dữ liệu mẫu ban đầu.

Trang giới thiệu hiển thị một mã QR dùng chung, mở trang đăng nhập rồi chuyển người dùng đến biểu mẫu tạo phiếu. Mã QR không tự điền vị trí.

Báo cáo tính thời gian chờ phân công, phản hồi và xử lý từ các mốc thời gian có trong dữ liệu. Kỹ thuật viên phải Check in/Check out bằng cách mở camera và chụp ảnh xác nhận; ảnh không được lưu và bản demo không nhận diện/xác minh danh tính. Chỉ KTV đã Check in mới được nhận phiếu hoặc bắt đầu/tiếp tục xử lý. Camera trên thiết bị khác cần website chạy trong secure context (HTTPS; localhost được trình duyệt cho phép). Đây vẫn là bản demo frontend: dữ liệu chỉ ở trình duyệt và chưa được xác thực, đồng bộ hoặc lưu qua backend.

Giao diện demo có Kanban riêng cho Admin/KTV, trao đổi và đánh giá phiếu, yêu cầu xử lý lại, cấu hình SLA/gợi ý KTV, sao lưu/khôi phục JSON và kho FAQ. Dữ liệu sao lưu chứa thông tin đăng nhập demo; không chia sẻ tệp này công khai.

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
- Giao diện hiện chạy theo dữ liệu demo trong trình duyệt. Backend và MySQL vẫn là bộ khung, chưa được kết nối hoặc dùng để xác thực/lưu dữ liệu.
- Không đưa mật khẩu, API key, khóa bí mật hoặc dữ liệu cá nhân thật của nhà trường lên GitHub.
- Việc kết nối dữ liệu thật của trường chỉ thực hiện khi được cấp quyền phù hợp.
