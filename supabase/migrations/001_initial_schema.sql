-- Create entries table
CREATE TABLE IF NOT EXISTS entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view all entries
CREATE POLICY "Entries are viewable by everyone"
  ON entries FOR SELECT
  USING (true);

-- Users can insert their own entries
CREATE POLICY "Users can insert their own entries"
  ON entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own entries
CREATE POLICY "Users can update their own entries"
  ON entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own entries
CREATE POLICY "Users can delete their own entries"
  ON entries FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS entries_user_id_idx ON entries(user_id);
CREATE INDEX IF NOT EXISTS entries_created_at_idx ON entries(created_at DESC);
-- Location indexes for latitude and longitude (simple B-tree indexes)
-- These work without PostGIS and are sufficient for basic location queries
CREATE INDEX IF NOT EXISTS entries_location_lat_idx ON entries(latitude);
CREATE INDEX IF NOT EXISTS entries_location_lng_idx ON entries(longitude);

