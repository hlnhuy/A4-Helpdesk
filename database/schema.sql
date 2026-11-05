/* =====================================================================
   A4 Helpdesk - Tao database + bang (SQL Server 2025 / SSMS 22)
   Chay toan bo script: Ctrl+A roi F5. Co the chay lai nhieu lan (an toan).
   Moi cot chu dung NVARCHAR de luu duoc tieng Viet co dau.
   ===================================================================== */
USE master;
GO
IF DB_ID(N'A4Helpdesk') IS NULL
    CREATE DATABASE A4Helpdesk COLLATE Vietnamese_100_CI_AS;
GO
USE A4Helpdesk;
GO

/* ---------- Nguoi dung & chuyen mon ---------- */
IF OBJECT_ID(N'dbo.users') IS NULL
CREATE TABLE dbo.users (
    id             INT IDENTITY(1,1) PRIMARY KEY,
    username       NVARCHAR(50)  NOT NULL,
    email          NVARCHAR(150) NOT NULL,
    password_hash  NVARCHAR(255) NOT NULL,              -- bcrypt/argon2, KHONG luu mat khau tho
    full_name      NVARCHAR(120) NOT NULL,
    phone          NVARCHAR(30)  NULL,
    role           NVARCHAR(20)  NOT NULL CONSTRAINT ck_users_role CHECK (role IN (N'admin', N'tech', N'user')),
    is_active      BIT NOT NULL CONSTRAINT df_users_active DEFAULT 1,
    is_available   BIT NOT NULL CONSTRAINT df_users_avail  DEFAULT 1,   -- KTV dang san sang nhan phieu
    created_at     DATETIME2(0) NOT NULL CONSTRAINT df_users_created DEFAULT SYSUTCDATETIME(),
    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT uq_users_email    UNIQUE (email)
);
GO
IF OBJECT_ID(N'dbo.skills') IS NULL
CREATE TABLE dbo.skills (
    id    INT IDENTITY(1,1) PRIMARY KEY,
    name  NVARCHAR(60) NOT NULL CONSTRAINT uq_skills_name UNIQUE
);
GO
IF OBJECT_ID(N'dbo.user_skills') IS NULL
CREATE TABLE dbo.user_skills (
    user_id  INT NOT NULL REFERENCES dbo.users(id) ON DELETE CASCADE,
    skill_id INT NOT NULL REFERENCES dbo.skills(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, skill_id)
);
GO

/* ---------- Yeu cau cap tai khoan ---------- */
IF OBJECT_ID(N'dbo.account_requests') IS NULL
CREATE TABLE dbo.account_requests (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    full_name   NVARCHAR(120) NOT NULL,
    email       NVARCHAR(150) NOT NULL,
    role        NVARCHAR(20)  NOT NULL DEFAULT N'user',
    note        NVARCHAR(500) NULL,
    status      NVARCHAR(20)  NOT NULL DEFAULT N'pending' CHECK (status IN (N'pending', N'approved', N'rejected')),
    created_at  DATETIME2(0)  NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

/* ---------- Phieu su co ---------- */
IF OBJECT_ID(N'dbo.tickets') IS NULL
CREATE TABLE dbo.tickets (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    code          AS (N'HD-' + RIGHT(N'0000' + CAST(id AS NVARCHAR(10)), 4)) PERSISTED,   -- HD-0001
    title         NVARCHAR(200) NOT NULL,
    type_id       INT NOT NULL REFERENCES dbo.skills(id),          -- Wi-Fi / Internet / LAN / Thiet bi / Khac
    description   NVARCHAR(MAX) NOT NULL,
    location      NVARCHAR(150) NOT NULL,
    priority      NVARCHAR(10)  NOT NULL CHECK (priority IN (N'low', N'mid', N'high', N'urgent')),
    status        NVARCHAR(10)  NOT NULL DEFAULT N'new' CHECK (status IN (N'new', N'doing', N'done', N'closed')),
    creator_id    INT NOT NULL REFERENCES dbo.users(id),
    tech_id       INT NULL REFERENCES dbo.users(id),
    rating        TINYINT NULL CHECK (rating BETWEEN 1 AND 5),
    rating_comment NVARCHAR(500) NULL,
    result_cause   NVARCHAR(500) NULL,
    result_action  NVARCHAR(500) NULL,
    result_outcome NVARCHAR(300) NULL,
    created_at    DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME(),
    assigned_at   DATETIME2(0) NULL,
    started_at    DATETIME2(0) NULL,
    resolved_at   DATETIME2(0) NULL,
    closed_at     DATETIME2(0) NULL
);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'ix_tickets_status')  CREATE INDEX ix_tickets_status  ON dbo.tickets(status, created_at DESC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'ix_tickets_tech')    CREATE INDEX ix_tickets_tech    ON dbo.tickets(tech_id, status);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'ix_tickets_creator') CREATE INDEX ix_tickets_creator ON dbo.tickets(creator_id, created_at DESC);
GO

IF OBJECT_ID(N'dbo.ticket_history') IS NULL
CREATE TABLE dbo.ticket_history (
    id         INT IDENTITY(1,1) PRIMARY KEY,
    ticket_id  INT NOT NULL REFERENCES dbo.tickets(id) ON DELETE CASCADE,
    actor      NVARCHAR(120) NOT NULL,                -- ten nguoi thuc hien hoac N'He thong'
    action     NVARCHAR(500) NOT NULL,
    created_at DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
IF OBJECT_ID(N'dbo.ticket_comments') IS NULL
CREATE TABLE dbo.ticket_comments (
    id         INT IDENTITY(1,1) PRIMARY KEY,
    ticket_id  INT NOT NULL REFERENCES dbo.tickets(id) ON DELETE CASCADE,
    user_id    INT NOT NULL REFERENCES dbo.users(id),
    body       NVARCHAR(500) NOT NULL,
    created_at DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
IF OBJECT_ID(N'dbo.attachments') IS NULL
CREATE TABLE dbo.attachments (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    ticket_id   INT NOT NULL REFERENCES dbo.tickets(id) ON DELETE CASCADE,
    file_name   NVARCHAR(255) NOT NULL,
    mime_type   NVARCHAR(100) NULL,
    size_bytes  INT NULL,
    storage_path NVARCHAR(500) NOT NULL,              -- duong dan tren dia / S3, khong luu file trong DB
    created_at  DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

/* ---------- Thong bao, cau hinh, nhat ky ---------- */
IF OBJECT_ID(N'dbo.notifications') IS NULL
CREATE TABLE dbo.notifications (
    id         INT IDENTITY(1,1) PRIMARY KEY,
    user_id    INT NOT NULL REFERENCES dbo.users(id) ON DELETE CASCADE,
    ticket_id  INT NULL REFERENCES dbo.tickets(id) ON DELETE SET NULL,
    message    NVARCHAR(500) NOT NULL,
    is_read    BIT NOT NULL DEFAULT 0,
    created_at DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'ix_notif_user') CREATE INDEX ix_notif_user ON dbo.notifications(user_id, is_read, created_at DESC);
GO
IF OBJECT_ID(N'dbo.settings') IS NULL
CREATE TABLE dbo.settings (
    [key]  NVARCHAR(60)  NOT NULL PRIMARY KEY,
    value  NVARCHAR(500) NOT NULL
);
GO
IF OBJECT_ID(N'dbo.audit_logs') IS NULL
CREATE TABLE dbo.audit_logs (
    id         INT IDENTITY(1,1) PRIMARY KEY,
    user_id    INT NULL REFERENCES dbo.users(id) ON DELETE SET NULL,
    message    NVARCHAR(500) NOT NULL,
    created_at DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

/* ---------- Du lieu khoi tao ---------- */
MERGE dbo.skills AS t
USING (VALUES (N'Wi-Fi'), (N'Internet'), (N'Mạng LAN'), (N'Thiết bị'), (N'Khác')) AS s(name) ON t.name = s.name
WHEN NOT MATCHED THEN INSERT (name) VALUES (s.name);
GO
MERGE dbo.settings AS t
USING (VALUES (N'sla_low', N'24'), (N'sla_mid', N'8'), (N'sla_high', N'4'), (N'sla_urgent', N'1'), (N'auto_assign', N'1')) AS s([key], value) ON t.[key] = s.[key]
WHEN NOT MATCHED THEN INSERT ([key], value) VALUES (s.[key], s.value);
GO

/* Tai khoan Admin dau tien se duoc backend tao (can bam mat khau bang bcrypt), khong chen bang SQL. */
SELECT N'Tao database A4Helpdesk thanh cong' AS ket_qua,
       (SELECT COUNT(*) FROM sys.tables) AS so_bang,
       (SELECT COUNT(*) FROM dbo.skills) AS so_chuyen_mon;
GO
