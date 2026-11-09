-- PENTING: ganti GANTI_DENGAN_PASSWORD_KAMU dengan password sungguhan hanya di komputermu.
-- Jangan commit password asli ke GitHub. Isi yang sama dipakai di DB_PASSWORD pada file .env.
-- Login KHUSUS untuk Tugas 2 (beda dari praktikum_user di hands-on),
-- supaya kredensial tugas & praktikum tidak tercampur.
USE master;
GO

IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = 'hilma')
BEGIN
    CREATE LOGIN hilma
        WITH PASSWORD = N'GANTI_DENGAN_PASSWORD_KAMU',
             DEFAULT_DATABASE = review_kantin;
END
GO

USE review_kantin;
GO

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'hilma')
BEGIN
    CREATE USER hilma FOR LOGIN hilma;
END
GO

ALTER ROLE db_datareader ADD MEMBER hilma;
ALTER ROLE db_datawriter ADD MEMBER hilma;
GO

SELECT name, type_desc, authentication_type_desc
FROM sys.database_principals
WHERE name = 'hilma';
GO
