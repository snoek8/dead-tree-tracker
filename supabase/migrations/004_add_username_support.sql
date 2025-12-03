-- Username support via auth.users metadata
-- Usernames will be stored in auth.users.raw_user_meta_data->>'username'

-- Function to check if a username is available (unique)
-- This function checks all users' metadata for username uniqueness
CREATE OR REPLACE FUNCTION check_username_available(username_to_check TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  username_exists BOOLEAN;
BEGIN
  -- Check if username already exists in any user's metadata
  SELECT EXISTS(
    SELECT 1
    FROM auth.users
    WHERE raw_user_meta_data->>'username' = username_to_check
  ) INTO username_exists;
  
  -- Return true if username is available (doesn't exist)
  RETURN NOT username_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get username from user_id
-- This helper function makes it easier to fetch usernames
CREATE OR REPLACE FUNCTION get_username(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  user_username TEXT;
BEGIN
  SELECT raw_user_meta_data->>'username'
  INTO user_username
  FROM auth.users
  WHERE id = user_uuid;
  
  RETURN COALESCE(user_username, NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get top contributors with entry counts
CREATE OR REPLACE FUNCTION get_top_contributors(limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  entry_count BIGINT,
  rank INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH user_entry_counts AS (
    SELECT 
      e.user_id,
      COUNT(*) as count
    FROM entries e
    GROUP BY e.user_id
    ORDER BY count DESC
    LIMIT limit_count
  )
  SELECT 
    uec.user_id,
    COALESCE(
      (SELECT raw_user_meta_data->>'username' FROM auth.users WHERE id = uec.user_id),
      (SELECT split_part(email, '@', 1) FROM auth.users WHERE id = uec.user_id),
      'Anonymous'
    ) as username,
    uec.count::BIGINT as entry_count,
    ROW_NUMBER() OVER (ORDER BY uec.count DESC)::INTEGER as rank
  FROM user_entry_counts uec
  ORDER BY uec.count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION check_username_available(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_username(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_contributors(INTEGER) TO authenticated;

