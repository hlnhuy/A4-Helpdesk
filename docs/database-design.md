# Thiết kế cơ sở dữ liệu

Các bảng dự kiến: roles, users, categories, tickets, ticket_assignments, ticket_updates, notifications, attachments, audit_logs.
`users.created_by` dùng để ghi nhận Admin tạo tài khoản. Mật khẩu chỉ lưu dưới dạng hash.
