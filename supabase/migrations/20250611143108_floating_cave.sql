/*
  # Initial AquaGuardian Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key) 
      - `email` (text, unique)
      - `role` (enum: farmer, buyer, admin)
      - `created_at` (timestamp)
    - `designs` 
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `name` (text)
      - `params` (jsonb for storing design parameters)
      - `created_at` (timestamp)
    - `tokens`
      - `id` (uuid, primary key) 
      - `design_id` (uuid, foreign key to designs)
      - `algorand_tx` (text for transaction hash)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Admin users can access all data
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('farmer', 'buyer', 'admin');

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role user_role DEFAULT 'farmer',
  created_at timestamptz DEFAULT now()
);

-- Create designs table
CREATE TABLE IF NOT EXISTS designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  params jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create tokens table
CREATE TABLE IF NOT EXISTS tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id uuid REFERENCES designs(id) ON DELETE CASCADE,
  algorand_tx text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin'
  ));

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin'
  ));

-- Designs policies
CREATE POLICY "Users can manage own designs"
  ON designs
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid()::uuid OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin'
  ));

-- Tokens policies  
CREATE POLICY "Users can manage tokens for own designs"
  ON tokens
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM designs WHERE designs.id = tokens.design_id 
    AND (designs.user_id = auth.uid()::uuid OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin'
    ))
  ));

-- Insert admin user (will be handled by auth trigger)
-- This is just a placeholder - actual user creation happens through Supabase Auth