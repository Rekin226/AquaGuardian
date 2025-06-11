/*
  # Auth Trigger Setup

  1. Function to sync auth.users with public.users
  2. Trigger to automatically create user profile on signup
  3. Function to seed admin user
*/

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to seed admin user (call this manually after setting up auth)
CREATE OR REPLACE FUNCTION seed_admin_user()
RETURNS void AS $$
BEGIN
  -- This will be called manually after auth setup
  -- Updates the role of admin@example.com to admin
  UPDATE public.users 
  SET role = 'admin' 
  WHERE email = 'admin@example.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;