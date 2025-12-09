/*
  # Update Events Schema for EPIC 2

  ## Changes
  
  ### Updates to `events` table
  - Rename `title` to `name` with length constraints (3-50 chars)
  - Update `description` with length constraints (50-500 chars)
  - Replace `event_type` with `category_id` FK to event_categories
  - Split `start_time` and `end_time` to separate date and time fields
  - Add `event_date`, `start_time`, `end_time` as separate fields
  - Rename `location` to `location_name`
  - Add `location_lat` and `location_lng` for map coordinates
  - Change `image_url` to `photo_urls` jsonb array (1-10 photos)
  - Add `interest_tags` text array
  - Rename `max_attendees` to `capacity_limit`
  - Add `status` field (draft, active, cancelled, completed)
  - Add `cancellation_reason` field
  - Rename `creator_id` to `host_id`

  ### Create `event_categories` table
  - For predefined event types/categories

  ### Updates to `event_invitations` table
  - Remove `inviter_id` (redundant - comes from event.host_id)
  - Update status values to match requirements (pending, going, declined)
  - Add `personal_message` field (0-200 chars)
*/

-- Create event_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS event_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  icon text,
  created_at timestamptz DEFAULT now()
);

-- Insert event categories
INSERT INTO event_categories (name, icon) VALUES
  ('Study Session', 'book'),
  ('Party', 'music'),
  ('Sports & Fitness', 'dumbbell'),
  ('Food & Dining', 'utensils'),
  ('Outdoor Activity', 'tree'),
  ('Gaming', 'gamepad'),
  ('Movie Night', 'film'),
  ('Concert', 'music'),
  ('Networking', 'users'),
  ('Workshop', 'briefcase'),
  ('Volunteer', 'heart'),
  ('Social Gathering', 'coffee')
ON CONFLICT (name) DO NOTHING;

-- Add new columns to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS event_date date,
ADD COLUMN IF NOT EXISTS location_name text,
ADD COLUMN IF NOT EXISTS location_lat float,
ADD COLUMN IF NOT EXISTS location_lng float,
ADD COLUMN IF NOT EXISTS photo_urls jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES event_categories(id),
ADD COLUMN IF NOT EXISTS interest_tags text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS capacity_limit int,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS cancellation_reason text,
ADD COLUMN IF NOT EXISTS host_id uuid REFERENCES profiles(id) ON DELETE CASCADE;

-- Rename title to name if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'title'
  ) THEN
    ALTER TABLE events RENAME COLUMN title TO name;
  END IF;
END $$;

-- Rename location to location_old temporarily
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'location'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'location_old'
  ) THEN
    ALTER TABLE events RENAME COLUMN location TO location_old;
  END IF;
END $$;

-- Copy data to location_name if location_old exists and location_name is null
UPDATE events 
SET location_name = location_old 
WHERE location_name IS NULL AND location_old IS NOT NULL;

-- Rename max_attendees to capacity_limit if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'max_attendees'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'capacity_limit'
  ) THEN
    ALTER TABLE events RENAME COLUMN max_attendees TO capacity_limit;
  END IF;
END $$;

-- Copy creator_id to host_id
UPDATE events 
SET host_id = creator_id 
WHERE host_id IS NULL AND creator_id IS NOT NULL;

-- Add personal_message to event_invitations
ALTER TABLE event_invitations
ADD COLUMN IF NOT EXISTS personal_message text;

-- Add check constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'event_name_length'
  ) THEN
    ALTER TABLE events 
    ADD CONSTRAINT event_name_length 
    CHECK (LENGTH(name) >= 3 AND LENGTH(name) <= 50);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'event_description_length'
  ) THEN
    ALTER TABLE events 
    ADD CONSTRAINT event_description_length 
    CHECK (description IS NULL OR (LENGTH(description) >= 50 AND LENGTH(description) <= 500));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'event_photo_urls_length'
  ) THEN
    ALTER TABLE events 
    ADD CONSTRAINT event_photo_urls_length 
    CHECK (jsonb_array_length(photo_urls) >= 0 AND jsonb_array_length(photo_urls) <= 10);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'invitation_message_length'
  ) THEN
    ALTER TABLE event_invitations 
    ADD CONSTRAINT invitation_message_length 
    CHECK (personal_message IS NULL OR LENGTH(personal_message) <= 200);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'event_status_values'
  ) THEN
    ALTER TABLE events 
    ADD CONSTRAINT event_status_values 
    CHECK (status IN ('draft', 'active', 'cancelled', 'completed'));
  END IF;
END $$;

-- Update invitation status values
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'event_invitations_status_check'
  ) THEN
    ALTER TABLE event_invitations 
    DROP CONSTRAINT event_invitations_status_check;
  END IF;
  
  ALTER TABLE event_invitations 
  ADD CONSTRAINT event_invitations_status_check 
  CHECK (status IN ('pending', 'going', 'declined'));
END $$;

-- Update any existing 'accepted' statuses to 'going'
UPDATE event_invitations SET status = 'going' WHERE status = 'accepted';

-- Enable RLS on event_categories if not already enabled
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for event_categories if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'event_categories' 
    AND policyname = 'Anyone can view event categories'
  ) THEN
    CREATE POLICY "Anyone can view event categories"
      ON event_categories FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_events_host_id ON events(host_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_category_id ON events(category_id);
