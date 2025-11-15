CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  token VARCHAR(50) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  checked_in_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_checkins_token ON checkins(token);
CREATE INDEX idx_checkins_booking ON checkins(booking_id);