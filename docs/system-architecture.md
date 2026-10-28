# Kiến trúc hệ thống

React + Vite gọi API FastAPI. FastAPI xử lý xác thực, phân quyền và nghiệp vụ, sau đó truy cập MySQL.
Không để frontend kết nối trực tiếp đến MySQL. Việc tích hợp dữ liệu thật của trường chỉ thực hiện khi được cấp quyền và tài liệu kết nối.
