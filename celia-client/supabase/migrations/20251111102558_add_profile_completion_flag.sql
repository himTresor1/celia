/*
  # Add Profile Completion Flag

  ## Changes
  - Add `is_profile_completed` boolean column to profiles table
  - Default to false for new profiles
  - Update existing profiles based on whether they have completed required fields

  ## Important Notes
  - This flag will be used to determine if user should be redirected to profile setup
  - Required fields for completion: full_name, bio (50+ chars), interests (3+)
*/

-- Add is_profile_completed column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_profile_completed boolean DEFAULT false;

-- Update existing profiles to set completion status
UPDATE profiles
SET is_profile_completed = true
WHERE full_name IS NOT NULL
  AND LENGTH(bio) >= 50
  AND array_length(interests, 1) >= 3;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_profile_completed ON profiles(is_profile_completed);
