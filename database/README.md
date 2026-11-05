# Database A4Helpdesk (SQL Server 2025 Express + SSMS 22)

1. Mo SSMS, ket noi `localhost\SQLEXPRESS02` (Windows Authentication, tick *Trust server certificate*).
2. Mo `schema.sql` -> **Ctrl+A -> F5**. Script tao database `A4Helpdesk`, 11 bang va du lieu khoi tao. Chay lai nhieu lan van an toan.
3. (Tuy chon) `seed.sql` nap lai chuyen mon + cau hinh SLA.
4. Tai khoan Admin va du lieu demo do backend tao (mat khau phai bam bcrypt, khong chen bang SQL).

Bang: users, skills, user_skills, account_requests, tickets, ticket_history, ticket_comments, attachments, notifications, settings, audit_logs.
