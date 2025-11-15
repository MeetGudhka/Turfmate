CREATE TABLE slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turf_id UUID NOT NULL REFERENCES turfs(id) ON DELETE CASCADE,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  is_booked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_slots_turf_time ON slots(turf_id, start_time);