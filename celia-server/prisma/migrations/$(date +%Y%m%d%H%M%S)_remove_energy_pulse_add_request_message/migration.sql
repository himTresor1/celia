-- Remove energy pulse fields and add request message field
ALTER TABLE "friendships" DROP COLUMN IF EXISTS "pulse_sent_by_user1";
ALTER TABLE "friendships" DROP COLUMN IF EXISTS "pulse_sent_by_user2";
ALTER TABLE "friendships" DROP COLUMN IF EXISTS "pulse_expires_at";
ALTER TABLE "friendships" ADD COLUMN IF NOT EXISTS "request_message" TEXT;
ALTER TABLE "friendships" ALTER COLUMN "connection_method" SET DEFAULT 'friend_request';

