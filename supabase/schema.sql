-- Create passcodes table for students and TAs
CREATE TABLE passcodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('student', 'ta')),
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE
);

-- Create games table to track active games
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'completed')),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_round INTEGER DEFAULT 1,
  max_rounds INTEGER DEFAULT 5,
  settings JSONB DEFAULT '{}'::JSONB
);

-- Create game_participants table to track who's in which game
CREATE TABLE game_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, user_id)
);

-- Create game_responses table to track student responses in games
CREATE TABLE game_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  round INTEGER NOT NULL,
  response JSONB NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, user_id, round)
);

-- Create RLS policies
-- Enable Row Level Security
ALTER TABLE passcodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_responses ENABLE ROW LEVEL SECURITY;

-- Passcodes policies
CREATE POLICY "TAs can view all passcodes" ON passcodes
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'ta');

-- Games policies
CREATE POLICY "Anyone can view active games" ON games
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "TAs can create and update games" ON games
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'ta');

-- Game participants policies
CREATE POLICY "Users can view their own participation" ON game_participants
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "TAs can view all participants" ON game_participants
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'ta');

CREATE POLICY "Users can join games" ON game_participants
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Game responses policies
CREATE POLICY "Users can view their own responses" ON game_responses
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "TAs can view all responses" ON game_responses
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'ta');

CREATE POLICY "Users can submit their own responses" ON game_responses
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create function to check if user is a TA
CREATE OR REPLACE FUNCTION is_ta()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT (auth.jwt() ->> 'role') = 'ta');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample data for testing
INSERT INTO passcodes (code, role, user_id) VALUES
('TA123456', 'ta', 'TA001'),
('STUDENT001', 'student', 'S001'),
('STUDENT002', 'student', 'S002'),
('STUDENT003', 'student', 'S003');
