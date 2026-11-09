-- ============================================================
-- Tugas 4 - Akun demo untuk menguji role Admin, Owner, dan Customer
--
-- Akun seed dari 03-seed-full.sql memakai password_hash placeholder
-- (mis. 'hash_admin'), jadi tidak bisa dipakai login. Script ini mengganti
-- hash-nya dengan hash bcrypt asli dari password demo: Kantin12345
--
-- Aman dijalankan berulang. Jalankan di DBeaver atau SSMS (tanpa GO).
-- Hanya untuk lingkungan belajar, jangan dipakai di server sungguhan.
-- ============================================================

USE review_kantin;

UPDATE dbo.USERS
SET password_hash = N'$2b$10$47sgmEmCvpx9MzZDIory1.zoj8LkQT6pqIvrOxIs0M1QyS2R181Z6'
WHERE email = N'admin@kantin.test' AND role = N'admin';

-- Bu Tini, pemilik Warung Bu Tini (stall id 1)
UPDATE dbo.USERS
SET password_hash = N'$2b$10$SADqFRT5ApsKJaVUaE6X2uykBZdOGVxVmRqUpto6OJBbHkxTh8GJ2'
WHERE email = N'tini@kantin.test' AND role = N'owner';

-- Pak Slamet, pemilik Kedai Pak Slamet (stall id 3)
UPDATE dbo.USERS
SET password_hash = N'$2b$10$XYgFjdbysNeOk5VGfmsbxeDwOcZgew7fD8c8YHVrZtKa8cR5Ipru.'
WHERE email = N'slamet@kantin.test' AND role = N'owner';

UPDATE dbo.USERS
SET password_hash = N'$2b$10$UtsAXLdWK8pQhvSQOuhed.rPJ2PjD1ERfP6S/k3xnmlgbgo4om/hK'
WHERE email = N'bagas@student.test' AND role = N'customer';

-- Cek hasil: keempat akun harus muncul dengan hash yang diawali $2b$10$
SELECT id, name, email, role, LEFT(password_hash, 7) AS hash_awal
FROM dbo.USERS
WHERE email IN (N'admin@kantin.test', N'tini@kantin.test', N'slamet@kantin.test', N'bagas@student.test')
ORDER BY id;
