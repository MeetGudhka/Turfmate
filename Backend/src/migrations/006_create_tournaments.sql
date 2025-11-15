CREATE TYPE tournament_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');

CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  turf_id UUID NOT NULL REFERENCES turfs(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status tournament_status DEFAULT 'upcoming',
  entry_fee NUMERIC(10,2),
  prize_pool NUMERIC(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tournament_teams (
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  PRIMARY KEY (tournament_id, team_id)
);