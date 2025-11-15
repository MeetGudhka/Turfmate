CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'checked_in');

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  turf_id UUID NOT NULL REFERENCES turfs(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  status booking_status DEFAULT 'pending',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_turf ON bookings(turf_id);
CREATE INDEX idx_bookings_status ON bookings(status);