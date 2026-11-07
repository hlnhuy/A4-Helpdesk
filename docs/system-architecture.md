# Kiến trúc hệ thống

Kiến trúc dự kiến: React + Vite gọi API FastAPI. FastAPI xử lý xác thực, phân quyền và nghiệp vụ, sau đó truy cập SQL Server qua SQLAlchemy và ODBC Driver 18.
Không để frontend kết nối trực tiếp đến SQL Server. Giao diện hiện vẫn dùng dữ liệu demo trong trình duyệt và chưa tích hợp với API; chỉ kết nối dữ liệu thật của trường khi được cấp quyền và tài liệu kết nối.
