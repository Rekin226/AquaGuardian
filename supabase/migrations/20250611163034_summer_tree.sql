/*
  # Fix infinite recursion in users table RLS policy

  1. Security Changes
    - Drop existing problematic RLS policies on users table
    - Create new safe RLS policies that don't cause infinite recursion
    - Use auth.uid() directly without subqueries to the same table

  2. Policy Details
    - Users can read their own data using simple auth.uid() = id comparison
    - Admins can read all data (will be handled separately if needed)
    - Users can update their own data using simple auth.uid() = id comparison
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create new safe policies without infinite recursion
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create a separate policy for admin access if needed
-- Note: This assumes you have a way to identify admins without querying the users table
-- You might need to use auth.jwt() claims or a separate admin table
CREATE POLICY "Service role can manage all users"
  ON users
  FOR ALL
  TO service_role
  USING (true);