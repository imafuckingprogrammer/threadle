CREATE TABLE IF NOT EXISTS puzzles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date        DATE UNIQUE NOT NULL,
  word_length INT NOT NULL CHECK (word_length >= 2 AND word_length <= 10),
  start_word  TEXT NOT NULL,
  end_word    TEXT NOT NULL,
  solution    TEXT[] NOT NULL,
  par         INT NOT NULL CHECK (par >= 1),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS puzzles_date_idx ON puzzles (date);

-- Row-level security: public can only read (never solution or par — filter in app layer)
ALTER TABLE puzzles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read non-sensitive puzzle fields"
  ON puzzles FOR SELECT
  USING (true);

CREATE POLICY "Service role can write puzzles"
  ON puzzles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update puzzles"
  ON puzzles FOR UPDATE
  USING (true);
