/*
  # Fix Conflicting Status Constraints

  1. Changes
    - Drop conflicting status constraint
    - Keep the constraint that allows 'pending', 'going', 'declined'
*/

-- Drop the conflicting constraint
ALTER TABLE event_invitations DROP CONSTRAINT IF EXISTS valid_status;
