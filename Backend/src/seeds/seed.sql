-- Insert admin
INSERT INTO users (name, email, password_hash, role)
VALUES ('Admin User', 'admin@turfmate.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insert turf owner
INSERT INTO users (name, email, password_hash, role)
VALUES ('Turf Owner', 'owner@turfmate.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'owner')
RETURNING id INTO owner_id;

-- Insert turfs
INSERT INTO turfs (name, address, owner_id, price_per_hour, description)
VALUES 
('Green Field Turf', '123 Sports Ave, City', (SELECT id FROM users WHERE email = 'owner@turfmate.com'), 500.00, 'Best artificial turf in town'),
('Elite Soccer Ground', '456 Football St, City', (SELECT id FROM users WHERE email = 'owner@turfmate.com'), 700.00, 'FIFA certified');

-- Insert sample slots (for next 7 days)
INSERT INTO slots (turf_id, start_time, end_time)
SELECT t.id, 
       generate_series(
         CURRENT_DATE + INTERVAL '1 day',
         CURRENT_DATE + INTERVAL '7 days',
         '1 day'::interval
       ) + (h * INTERVAL '1 hour'),
       generate_series(
         CURRENT_DATE + INTERVAL '1 day',
         CURRENT_DATE + INTERVAL '7 days',
         '1 day'::interval
       ) + ((h + 1) * INTERVAL '1 hour')
FROM turfs t
CROSS JOIN generate_series(9, 21) h;

-- Insert regular user
INSERT INTO users (name, email, password_hash, role)
VALUES ('John Doe', 'john@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');