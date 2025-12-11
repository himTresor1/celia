/*
  # CELIA Enhanced Database Schema - Complete Implementation

  This migration includes all enhancements:
  1. User profile enhancements (age, gender, gamification fields)
  2. Friendship system with Energy Pulse
  3. Three user lists (Saved, Friends, Invitees)
  4. Enhanced events with external links
  5. Enhanced invitations with decline reasons
  6. Engagement logging system
  7. Complete RLS policies
  8. Indexes for performance
*/

-- ============================================================================
-- STEP 1: Enhance profiles table
-- ============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age integer;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say', null));

-- Gamification fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS attractiveness_score integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS engagement_points integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_streak_days integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_date date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS app_opens_count integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completeness integer DEFAULT 0;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_profiles_attractiveness_score ON profiles(attractiveness_score DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_age ON profiles(age);

-- Function to compute age from date_of_birth
CREATE OR REPLACE FUNCTION compute_age(date_of_birth date)
RETURNS integer AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(date_of_birth));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-update age
CREATE OR REPLACE FUNCTION update_user_age()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.date_of_birth IS NOT NULL THEN
    NEW.age := compute_age(NEW.date_of_birth);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_age ON profiles;
CREATE TRIGGER trigger_update_user_age
  BEFORE INSERT OR UPDATE OF date_of_birth ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_age();

-- ============================================================================
-- STEP 2: Create friendships table
-- ============================================================================

CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired')),
  connection_method text NOT NULL CHECK (connection_method IN ('energy_pulse', 'qr_code', 'streak_handshake')),
  initiated_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Energy Pulse fields
  pulse_sent_by_user1 timestamptz,
  pulse_sent_by_user2 timestamptz,
  pulse_expires_at timestamptz,

  -- QR Code fields
  qr_code_token text UNIQUE,
  qr_generated_at timestamptz,
  qr_scanned_at timestamptz,

  -- Streak Handshake fields
  streak_day_required integer,
  user1_streak_met boolean DEFAULT false,
  user2_streak_met boolean DEFAULT false,

  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,

  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id) -- Enforce canonical ordering
);

CREATE INDEX IF NOT EXISTS idx_friendships_user1 ON friendships(user1_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user2 ON friendships(user2_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friendships
CREATE POLICY "Users can view their friendships"
  ON friendships FOR SELECT
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create friendships"
  ON friendships FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their friendships"
  ON friendships FOR UPDATE
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id)
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can delete their friendships"
  ON friendships FOR DELETE
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- ============================================================================
-- STEP 3: Create saved_users table
-- ============================================================================

CREATE TABLE IF NOT EXISTS saved_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  saved_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  saved_from_context text CHECK (saved_from_context IN ('just_looking', 'event_browse', 'profile_view', null)),
  notes text,
  created_at timestamptz DEFAULT now(),

  UNIQUE(user_id, saved_user_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_users_user_id ON saved_users(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_users_saved_user_id ON saved_users(saved_user_id);
CREATE INDEX IF NOT EXISTS idx_saved_users_created_at ON saved_users(created_at DESC);

ALTER TABLE saved_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_users
CREATE POLICY "Users can view their saved list"
  ON saved_users FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their saved list"
  ON saved_users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their saved list"
  ON saved_users FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 4: Create user_invitees table
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_invitees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invitee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  first_invited_at timestamptz DEFAULT now(),
  last_invited_at timestamptz DEFAULT now(),
  total_invitations integer DEFAULT 1,
  events_invited_to uuid[] DEFAULT '{}',

  UNIQUE(user_id, invitee_id)
);

CREATE INDEX IF NOT EXISTS idx_user_invitees_user_id ON user_invitees(user_id);
CREATE INDEX IF NOT EXISTS idx_user_invitees_invitee_id ON user_invitees(invitee_id);

ALTER TABLE user_invitees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_invitees
CREATE POLICY "Users can view their invitees"
  ON user_invitees FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage invitees"
  ON user_invitees FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- STEP 5: Enhance events table
-- ============================================================================

ALTER TABLE events ADD COLUMN IF NOT EXISTS external_link text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS external_link_type text CHECK (external_link_type IN ('google_form', 'eventbrite', 'whatsapp', 'website', 'other', null));

-- ============================================================================
-- STEP 6: Enhance event_invitations table
-- ============================================================================

ALTER TABLE event_invitations ADD COLUMN IF NOT EXISTS decline_reason text CHECK (decline_reason IN ('schedule_conflict', 'not_interested', 'too_far', 'other', null));

-- Update status check constraint to use 'going' instead of 'accepted'
DO $$
BEGIN
  ALTER TABLE event_invitations DROP CONSTRAINT IF EXISTS event_invitations_status_check;
  ALTER TABLE event_invitations ADD CONSTRAINT event_invitations_status_check
    CHECK (status IN ('pending', 'going', 'declined'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- STEP 7: Create engagement_logs table
-- ============================================================================

CREATE TABLE IF NOT EXISTS engagement_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  points_earned integer NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_engagement_logs_user_id ON engagement_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_engagement_logs_action_type ON engagement_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_engagement_logs_created_at ON engagement_logs(created_at DESC);

ALTER TABLE engagement_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for engagement_logs
CREATE POLICY "Users can view their engagement logs"
  ON engagement_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create engagement logs"
  ON engagement_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- STEP 8: Scoring Functions
-- ============================================================================

-- Function to calculate attractiveness score
CREATE OR REPLACE FUNCTION calculate_attractiveness_score(user_profile_id uuid)
RETURNS integer AS $$
DECLARE
  score integer := 0;
  profile_fields integer := 0;
  friends_count integer := 0;
  events_attended integer := 0;
  invitations_received integer := 0;
  invitations_accepted integer := 0;
  acceptance_ratio numeric := 0;
BEGIN
  -- Get user data
  SELECT
    (CASE WHEN full_name IS NOT NULL AND full_name != '' THEN 1 ELSE 0 END +
     CASE WHEN bio IS NOT NULL AND length(bio) >= 50 THEN 1 ELSE 0 END +
     CASE WHEN college_name IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN major IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN array_length(interests, 1) >= 3 THEN 1 ELSE 0 END +
     CASE WHEN jsonb_array_length(photo_urls::jsonb) >= 1 THEN 1 ELSE 0 END +
     CASE WHEN array_length(preferred_locations, 1) >= 1 THEN 1 ELSE 0 END) AS fields,
    engagement_points,
    social_streak_days
  INTO profile_fields
  FROM profiles
  WHERE id = user_profile_id;

  -- Profile Completeness (0-25 points)
  score := score + (profile_fields * 25 / 7);

  -- Friends Count (0-20 points) - Logarithmic
  SELECT COUNT(*)
  INTO friends_count
  FROM friendships
  WHERE (user1_id = user_profile_id OR user2_id = user_profile_id) AND status = 'active';

  score := score + LEAST(20, floor(log(friends_count + 1) * 6));

  -- Events Attended (0-15 points)
  SELECT COUNT(*)
  INTO events_attended
  FROM event_attendees
  WHERE user_id = user_profile_id;

  score := score + LEAST(15, floor(log(events_attended + 1) * 5));

  -- Invitation Acceptance Ratio (0-15 points)
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'going')
  INTO invitations_received, invitations_accepted
  FROM event_invitations
  WHERE invitee_id = user_profile_id;

  IF invitations_received > 0 THEN
    acceptance_ratio := invitations_accepted::numeric / invitations_received;
    score := score + floor(acceptance_ratio * 15);
  END IF;

  -- Engagement Points (0-15 points)
  SELECT engagement_points
  INTO score
  FROM profiles
  WHERE id = user_profile_id;

  score := score + LEAST(15, floor((SELECT engagement_points FROM profiles WHERE id = user_profile_id) / 1000.0 * 15));

  -- Social Streak (0-10 points)
  SELECT social_streak_days
  INTO score
  FROM profiles
  WHERE id = user_profile_id;

  score := score + LEAST(10, floor((SELECT social_streak_days FROM profiles WHERE id = user_profile_id) / 30.0 * 10));

  RETURN LEAST(100, score);
END;
$$ LANGUAGE plpgsql;

-- Function to log engagement and update score
CREATE OR REPLACE FUNCTION log_engagement(
  p_user_id uuid,
  p_action_type text,
  p_points_earned integer,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Insert engagement log
  INSERT INTO engagement_logs (user_id, action_type, points_earned, metadata)
  VALUES (p_user_id, p_action_type, p_points_earned, p_metadata);

  -- Update engagement points
  UPDATE profiles
  SET engagement_points = engagement_points + p_points_earned
  WHERE id = p_user_id;

  -- Recalculate attractiveness score
  UPDATE profiles
  SET attractiveness_score = calculate_attractiveness_score(p_user_id)
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update streak
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id uuid)
RETURNS void AS $$
DECLARE
  last_active date;
  current_streak integer;
BEGIN
  SELECT last_active_date, social_streak_days
  INTO last_active, current_streak
  FROM profiles
  WHERE id = p_user_id;

  IF last_active IS NULL OR last_active < CURRENT_DATE - INTERVAL '1 day' THEN
    -- Reset streak if missed a day
    IF last_active < CURRENT_DATE - INTERVAL '1 day' THEN
      current_streak := 0;
    END IF;

    -- Increment streak if opened today
    IF last_active IS NULL OR last_active < CURRENT_DATE THEN
      current_streak := current_streak + 1;

      -- Award points for maintaining streak
      IF current_streak = 7 THEN
        PERFORM log_engagement(p_user_id, 'streak_7_days', 50);
      ELSIF current_streak = 30 THEN
        PERFORM log_engagement(p_user_id, 'streak_30_days', 200);
      END IF;
    END IF;

    UPDATE profiles
    SET
      last_active_date = CURRENT_DATE,
      social_streak_days = current_streak,
      app_opens_count = app_opens_count + 1
    WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 9: Triggers
-- ============================================================================

-- Trigger to track invitation history in user_invitees
CREATE OR REPLACE FUNCTION track_invitation_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_invitees (user_id, invitee_id, last_invited_at, events_invited_to)
  VALUES (NEW.inviter_id, NEW.invitee_id, now(), ARRAY[NEW.event_id])
  ON CONFLICT (user_id, invitee_id)
  DO UPDATE SET
    last_invited_at = now(),
    total_invitations = user_invitees.total_invitations + 1,
    events_invited_to = array_append(user_invitees.events_invited_to, NEW.event_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_track_invitation ON event_invitations;
CREATE TRIGGER trigger_track_invitation
  AFTER INSERT ON event_invitations
  FOR EACH ROW
  EXECUTE FUNCTION track_invitation_history();

-- Trigger to award points for various actions
CREATE OR REPLACE FUNCTION award_action_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Award points based on action type
  IF TG_TABLE_NAME = 'event_invitations' THEN
    IF NEW.status = 'going' AND OLD.status != 'going' THEN
      PERFORM log_engagement(NEW.invitee_id, 'invitation_accept', 5);
    END IF;
  ELSIF TG_TABLE_NAME = 'events' AND TG_OP = 'INSERT' THEN
    PERFORM log_engagement(NEW.host_id, 'event_create', 25);
  ELSIF TG_TABLE_NAME = 'event_attendees' AND TG_OP = 'INSERT' THEN
    PERFORM log_engagement(NEW.user_id, 'event_attend', 30);
  ELSIF TG_TABLE_NAME = 'friendships' THEN
    IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
      PERFORM log_engagement(NEW.user1_id, 'friend_add', 20);
      PERFORM log_engagement(NEW.user2_id, 'friend_add', 20);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_award_points_invitations ON event_invitations;
CREATE TRIGGER trigger_award_points_invitations
  AFTER UPDATE ON event_invitations
  FOR EACH ROW
  EXECUTE FUNCTION award_action_points();

DROP TRIGGER IF EXISTS trigger_award_points_events ON events;
CREATE TRIGGER trigger_award_points_events
  AFTER INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION award_action_points();

DROP TRIGGER IF EXISTS trigger_award_points_attendees ON event_attendees;
CREATE TRIGGER trigger_award_points_attendees
  AFTER INSERT ON event_attendees
  FOR EACH ROW
  EXECUTE FUNCTION award_action_points();

DROP TRIGGER IF EXISTS trigger_award_points_friendships ON friendships;
CREATE TRIGGER trigger_award_points_friendships
  AFTER INSERT OR UPDATE ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION award_action_points();

-- ============================================================================
-- STEP 10: Utility Views
-- ============================================================================

-- View for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT
  p.id AS user_id,
  p.full_name,
  p.attractiveness_score,
  p.engagement_points,
  p.social_streak_days,
  COUNT(DISTINCT CASE WHEN f.status = 'active' THEN
    CASE WHEN f.user1_id = p.id THEN f.user2_id ELSE f.user1_id END
  END) AS friends_count,
  COUNT(DISTINCT e.id) AS events_hosted,
  COUNT(DISTINCT ea.event_id) AS events_attended,
  COUNT(DISTINCT ei_received.id) AS invitations_received,
  COUNT(DISTINCT CASE WHEN ei_received.status = 'going' THEN ei_received.id END) AS invitations_accepted
FROM profiles p
LEFT JOIN friendships f ON (p.id = f.user1_id OR p.id = f.user2_id)
LEFT JOIN events e ON p.id = e.host_id
LEFT JOIN event_attendees ea ON p.id = ea.user_id
LEFT JOIN event_invitations ei_received ON p.id = ei_received.invitee_id
GROUP BY p.id;

-- ============================================================================
-- Complete!
-- ============================================================================

-- This migration provides:
-- ✅ Enhanced user profiles with gamification
-- ✅ Friendship system with Energy Pulse
-- ✅ Three user lists (Saved, Friends, Invitees)
-- ✅ Enhanced events with external links
-- ✅ Engagement logging and scoring
-- ✅ Complete RLS policies
-- ✅ Triggers for automatic updates
-- ✅ Performance indexes
-- ✅ Utility views and functions
