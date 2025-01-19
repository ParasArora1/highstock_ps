/*
  # Fix user_ranks table constraints

  1. Changes
    - Add unique constraint on user_id column in user_ranks table
    - This fixes the ON CONFLICT error in the update_user_ranks function

  2. Security
    - No changes to existing security policies
*/

-- Add unique constraint to user_ranks table
ALTER TABLE user_ranks 
ADD CONSTRAINT user_ranks_user_id_key UNIQUE (user_id);

-- Drop and recreate the function with proper error handling
CREATE OR REPLACE FUNCTION update_user_ranks()
RETURNS TRIGGER AS $$
BEGIN
  -- Update ranks for all users based on total pizzas eaten
  WITH ranked_users AS (
    SELECT 
      u.id as user_id,
      COUNT(us.id) as total_eaten,
      RANK() OVER (ORDER BY COUNT(us.id) DESC) as new_rank
    FROM users u
    LEFT JOIN user_slices us ON u.id = us.user_id AND us.eaten_at IS NOT NULL
    GROUP BY u.id
  )
  INSERT INTO user_ranks (user_id, rank, total_eaten)
  SELECT 
    user_id,
    new_rank,
    total_eaten
  FROM ranked_users
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    rank = EXCLUDED.rank,
    total_eaten = EXCLUDED.total_eaten,
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;