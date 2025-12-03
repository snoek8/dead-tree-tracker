-- Drop all existing policies on entries table
DROP POLICY IF EXISTS "Entries are viewable by everyone" ON entries;
DROP POLICY IF EXISTS "Users can insert their own entries" ON entries;
DROP POLICY IF EXISTS "Users can update their own entries" ON entries;
DROP POLICY IF EXISTS "Users can delete their own entries" ON entries;

-- Recreate all policies with proper checks

-- Users can view all entries
CREATE POLICY "Entries are viewable by everyone"
  ON entries FOR SELECT
  USING (true);

-- Users can insert their own entries
-- This policy ensures auth.uid() matches the user_id being inserted
CREATE POLICY "Users can insert their own entries"
  ON entries FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

-- Users can update their own entries
CREATE POLICY "Users can update their own entries"
  ON entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own entries
CREATE POLICY "Users can delete their own entries"
  ON entries FOR DELETE
  USING (auth.uid() = user_id);
