/*
  # CELIA App Initial Database Schema

  ## Overview
  This migration creates the core database structure for CELIA, an event creation and invitation app for college students.

  ## New Tables

  ### 1. `profiles`
  User profile information extending auth.users
  - `id` (uuid, FK to auth.users) - User ID
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `college_name` (text) - College/University name
  - `major` (text) - Student's major
  - `graduation_year` (integer) - Expected graduation year
  - `bio` (text) - User biography
  - `avatar_url` (text) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `events`
  Event information created by users
  - `id` (uuid, PK) - Event ID
  - `creator_id` (uuid, FK to profiles) - User who created the event
  - `title` (text) - Event title
  - `description` (text) - Event description
  - `event_type` (text) - Type of event (social, academic, sports, etc.)
  - `location` (text) - Event location
  - `start_time` (timestamptz) - Event start time
  - `end_time` (timestamptz) - Event end time
  - `max_attendees` (integer) - Maximum number of attendees
  - `is_public` (boolean) - Whether event is public or private
  - `image_url` (text) - Event image/banner
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `event_invitations`
  Event invitations and RSVPs
  - `id` (uuid, PK) - Invitation ID
  - `event_id` (uuid, FK to events) - Event reference
  - `invitee_id` (uuid, FK to profiles) - Invited user
  - `inviter_id` (uuid, FK to profiles) - User who sent invitation
  - `status` (text) - Invitation status (pending, accepted, declined)
  - `created_at` (timestamptz) - Invitation sent time
  - `responded_at` (timestamptz) - Response timestamp

  ### 4. `event_attendees`
  Confirmed event attendees
  - `id` (uuid, PK) - Attendee record ID
  - `event_id` (uuid, FK to events) - Event reference
  - `user_id` (uuid, FK to profiles) - Attendee user
  - `joined_at` (timestamptz) - When user joined event

  ## Security
  - Enable RLS on all tables
  - Users can read/update their own profile
  - Users can read public events and events they're invited to
  - Users can create events and manage their own events
  - Users can manage invitations they sent or received
  - Users can view attendees of events they have access to

  ## Important Notes
  - All tables include appropriate indexes for performance
  - Timestamps use timestamptz for timezone awareness
  - Foreign key constraints ensure data integrity
  - Cascading deletes where appropriate
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  college_name text,
  major text,
  graduation_year integer,
  bio text DEFAULT '',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  event_type text NOT NULL,
  location text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  max_attendees integer,
  is_public boolean DEFAULT true,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_times CHECK (end_time > start_time),
  CONSTRAINT valid_max_attendees CHECK (max_attendees IS NULL OR max_attendees > 0)
);

-- Create event_invitations table
CREATE TABLE IF NOT EXISTS event_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  invitee_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  inviter_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  created_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'declined')),
  UNIQUE(event_id, invitee_id)
);

-- Create event_attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_creator ON events(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_invitations_event ON event_invitations(event_id);
CREATE INDEX IF NOT EXISTS idx_invitations_invitee ON event_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_attendees_event ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_attendees_user ON event_attendees(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Events policies
CREATE POLICY "Users can view public events"
  ON events FOR SELECT
  TO authenticated
  USING (
    is_public = true
    OR creator_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM event_invitations
      WHERE event_invitations.event_id = events.id
      AND event_invitations.invitee_id = auth.uid()
    )
  );

CREATE POLICY "Users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own events"
  ON events FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own events"
  ON events FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Event invitations policies
CREATE POLICY "Users can view their invitations"
  ON event_invitations FOR SELECT
  TO authenticated
  USING (
    auth.uid() = invitee_id
    OR auth.uid() = inviter_id
    OR EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_invitations.event_id
      AND events.creator_id = auth.uid()
    )
  );

CREATE POLICY "Event creators can send invitations"
  ON event_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_id
      AND events.creator_id = auth.uid()
    )
    AND auth.uid() = inviter_id
  );

CREATE POLICY "Invitees can update invitation status"
  ON event_invitations FOR UPDATE
  TO authenticated
  USING (auth.uid() = invitee_id)
  WITH CHECK (auth.uid() = invitee_id);

CREATE POLICY "Inviters can delete invitations"
  ON event_invitations FOR DELETE
  TO authenticated
  USING (auth.uid() = inviter_id);

-- Event attendees policies
CREATE POLICY "Users can view attendees of accessible events"
  ON event_attendees FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_attendees.event_id
      AND (
        events.is_public = true
        OR events.creator_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM event_invitations
          WHERE event_invitations.event_id = events.id
          AND event_invitations.invitee_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can join events"
  ON event_attendees FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_id
      AND (
        events.is_public = true
        OR EXISTS (
          SELECT 1 FROM event_invitations
          WHERE event_invitations.event_id = events.id
          AND event_invitations.invitee_id = auth.uid()
          AND event_invitations.status = 'accepted'
        )
      )
    )
  );

CREATE POLICY "Users can leave events"
  ON event_attendees FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
