/*
  # Create Event Invitations Schema

  1. New Tables
    - `event_invitations`
      - `id` (uuid, primary key)
      - `event_id` (uuid, foreign key to events)
      - `inviter_id` (uuid, foreign key to profiles) - person who sent the invite
      - `invitee_id` (uuid, foreign key to profiles) - person receiving the invite
      - `status` (text) - 'pending', 'accepted', 'declined'
      - `message` (text, optional) - personal message from inviter
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `event_invitations` table
    - Add policies for:
      - Invitees can view their own invitations
      - Invitees can update their invitation status
      - Inviters can view invitations they sent
      - Event hosts can view all invitations for their events

  3. Indexes
    - Index on invitee_id for fast lookup of user's invitations
    - Index on event_id for fast lookup of event invitations
    - Index on status for filtering
*/

-- Create invitations table
CREATE TABLE IF NOT EXISTS event_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  inviter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invitee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(event_id, invitee_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invitations_invitee ON event_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_invitations_event ON event_invitations(event_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON event_invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_created_at ON event_invitations(created_at DESC);

-- Enable RLS
ALTER TABLE event_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Invitees can view invitations sent to them
CREATE POLICY "Users can view invitations sent to them"
  ON event_invitations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = invitee_id);

-- Policy: Inviters can view invitations they sent
CREATE POLICY "Users can view invitations they sent"
  ON event_invitations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = inviter_id);

-- Policy: Event hosts can view all invitations for their events
CREATE POLICY "Event hosts can view all event invitations"
  ON event_invitations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_invitations.event_id
      AND events.host_id = auth.uid()
    )
  );

-- Policy: Users can update invitation status if they are the invitee
CREATE POLICY "Users can update their invitation status"
  ON event_invitations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = invitee_id)
  WITH CHECK (auth.uid() = invitee_id);

-- Policy: Event hosts can create invitations for their events
CREATE POLICY "Event hosts can create invitations"
  ON event_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_invitations.event_id
      AND events.host_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_invitation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_invitations_updated_at ON event_invitations;
CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON event_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_invitation_updated_at();
