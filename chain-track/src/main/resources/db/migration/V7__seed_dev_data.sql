-- 3 sample organizations (one of each type)
INSERT INTO organizations (name, type, contact_email, address)
VALUES ('AlphaMfg Corporation',  'MANUFACTURER', 'admin@alphamfg.com',   '123 Factory Lane, Addis Ababa'),
       ('SwiftShip Logistics',   'SHIPPER',       'ops@swiftship.com',    '456 Freight Road, Addis Ababa'),
       ('RetailMart Ethiopia',   'RETAILER',      'store@retailmart.com', '789 Market Street, Addis Ababa');

-- 1 ADMIN user  (password = Admin@1234  — BCrypt cost 12 hash)
INSERT INTO users (email, password_hash, role, organization_id)
VALUES ('admin@chaintrack.com',
        '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'ADMIN',
        1);