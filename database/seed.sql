/* Du lieu khoi tao toi thieu. Da duoc schema.sql nap san; chay file nay neu ban muon nap lai.   
   Tai khoan Admin KHONG tao bang SQL (mat khau phai bam bcrypt) - backend tu tao o lan chay dau. */

USE A4Helpdesk;
GO

MERGE dbo.skills AS t
USING (VALUES (N'Wi-Fi'), (N'Internet'), (N'Mạng LAN'), (N'Thiết bị'), (N'Khác')) AS s(name) 
ON t.name = s.name
WHEN NOT MATCHED THEN INSERT (name) VALUES (s.name);
GO

MERGE dbo.settings AS t
USING (VALUES (N'sla_low', N'24'), (N'sla_mid', N'8'), (N'sla_high', N'4'), (N'sla_urgent', N'1'), (N'auto_assign', N'1')) AS s([key], value) 
ON t.[key] = s.[key]
WHEN NOT MATCHED THEN INSERT ([key], value) VALUES (s.[key], s.value);
GO

SELECT * FROM dbo.skills; 
SELECT * FROM dbo.settings;
GO
