-- Add to a new migration file: 012_refresh_tokens.sql
CREATE TABLE IF NOT EXISTS refresh_tokens (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL
);