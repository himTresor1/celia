/*
  # Create Profile on User Signup

  ## Changes
  - Create a trigger that automatically creates a profile when a new user signs up
  - Profile will have is_profile_completed set to false by default

  ## Important Notes
  - This ensures every user has a profile record
  - Profile completion flag starts as false, requiring profile setup
*/

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_profile_completed)
  VALUES (new.id, new.email, false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
