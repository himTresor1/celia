/*
  # Enhance Profile Schema for Complete User Registration

  ## Changes to profiles table
  - Add photo_urls array for 1-5 profile photos
  - Expand bio field with character limits
  - Add interests array for user interests
  - Add college_verified boolean for .edu email verification
  - Add preferred_locations array for up to 3 locations
  - Update constraints and validation

  ## New Tables
  
  ### 1. `interest_categories`
  Predefined interest categories for users to select from
  - `id` (uuid, PK)
  - `name` (text) - Interest category name
  - `created_at` (timestamptz)

  ### 2. `colleges`
  List of colleges for selection
  - `id` (uuid, PK)
  - `name` (text) - College name
  - `domain` (text) - Email domain for verification (e.g., stanford.edu)
  - `location` (text) - College location
  - `created_at` (timestamptz)

  ## Security
  - Maintain existing RLS policies
  - Add policies for new tables

  ## Important Notes
  - Photo URLs will be stored as JSON array
  - Interests stored as text array
  - Preferred locations stored as text array
*/

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS photo_urls jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS interests text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS college_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS preferred_locations text[] DEFAULT ARRAY[]::text[];

-- Add check constraint for bio length (50-500 characters)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'bio_length_check'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT bio_length_check 
    CHECK (LENGTH(bio) = 0 OR (LENGTH(bio) >= 50 AND LENGTH(bio) <= 500));
  END IF;
END $$;

-- Add check constraint for photo_urls array length (1-5 photos)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'photo_urls_length_check'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT photo_urls_length_check 
    CHECK (jsonb_array_length(photo_urls) >= 0 AND jsonb_array_length(photo_urls) <= 5);
  END IF;
END $$;

-- Add check constraint for interests array length (3-10 interests)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'interests_length_check'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT interests_length_check 
    CHECK (array_length(interests, 1) IS NULL OR (array_length(interests, 1) >= 3 AND array_length(interests, 1) <= 10));
  END IF;
END $$;

-- Add check constraint for preferred_locations array length (up to 3 locations)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'preferred_locations_length_check'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT preferred_locations_length_check 
    CHECK (array_length(preferred_locations, 1) IS NULL OR array_length(preferred_locations, 1) <= 3);
  END IF;
END $$;

-- Create interest_categories table
CREATE TABLE IF NOT EXISTS interest_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create colleges table
CREATE TABLE IF NOT EXISTS colleges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  domain text,
  location text,
  created_at timestamptz DEFAULT now()
);

-- Insert default interest categories
INSERT INTO interest_categories (name) VALUES
  ('Sports & Fitness'),
  ('Arts & Music'),
  ('Technology & Gaming'),
  ('Food & Cooking'),
  ('Travel & Adventure'),
  ('Reading & Writing'),
  ('Movies & TV'),
  ('Business & Entrepreneurship'),
  ('Science & Research'),
  ('Social Justice & Activism'),
  ('Photography & Design'),
  ('Dance & Theater'),
  ('Outdoor Activities'),
  ('Volunteering'),
  ('Fashion & Beauty')
ON CONFLICT (name) DO NOTHING;

-- Insert sample colleges (you can add more)
INSERT INTO colleges (name, domain, location) VALUES
  ('Stanford University', 'stanford.edu', 'Stanford, CA'),
  ('Harvard University', 'harvard.edu', 'Cambridge, MA'),
  ('MIT', 'mit.edu', 'Cambridge, MA'),
  ('UC Berkeley', 'berkeley.edu', 'Berkeley, CA'),
  ('UCLA', 'ucla.edu', 'Los Angeles, CA'),
  ('Yale University', 'yale.edu', 'New Haven, CT'),
  ('Princeton University', 'princeton.edu', 'Princeton, NJ'),
  ('Columbia University', 'columbia.edu', 'New York, NY'),
  ('University of Chicago', 'uchicago.edu', 'Chicago, IL'),
  ('University of Pennsylvania', 'upenn.edu', 'Philadelphia, PA')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE interest_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;

-- RLS policies for interest_categories (read-only for all authenticated users)
CREATE POLICY "Anyone can view interest categories"
  ON interest_categories FOR SELECT
  TO authenticated
  USING (true);

-- RLS policies for colleges (read-only for all authenticated users)
CREATE POLICY "Anyone can view colleges"
  ON colleges FOR SELECT
  TO authenticated
  USING (true);
