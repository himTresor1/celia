-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "date_of_birth" DATE,
    "age" INTEGER,
    "gender" TEXT,
    "college_name" TEXT,
    "college_id" TEXT,
    "major" TEXT,
    "graduation_year" INTEGER,
    "bio" TEXT NOT NULL DEFAULT '',
    "avatar_url" TEXT,
    "photo_urls" JSONB NOT NULL DEFAULT '[]',
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "college_verified" BOOLEAN NOT NULL DEFAULT false,
    "preferred_locations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferred_city_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "profile_completed" BOOLEAN NOT NULL DEFAULT false,
    "attractiveness_score" INTEGER NOT NULL DEFAULT 0,
    "engagement_points" INTEGER NOT NULL DEFAULT 0,
    "social_streak_days" INTEGER NOT NULL DEFAULT 0,
    "last_active_date" DATE,
    "app_opens_count" INTEGER NOT NULL DEFAULT 0,
    "profile_completeness" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friendships" (
    "id" TEXT NOT NULL,
    "user1_id" TEXT NOT NULL,
    "user2_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "connection_method" TEXT NOT NULL,
    "initiated_by" TEXT NOT NULL,
    "pulse_sent_by_user1" TIMESTAMP(3),
    "pulse_sent_by_user2" TIMESTAMP(3),
    "pulse_expires_at" TIMESTAMP(3),
    "qr_code_token" TEXT,
    "qr_generated_at" TIMESTAMP(3),
    "qr_scanned_at" TIMESTAMP(3),
    "streak_day_required" INTEGER,
    "user1_streak_met" BOOLEAN NOT NULL DEFAULT false,
    "user2_streak_met" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "friendships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_users" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "saved_user_id" TEXT NOT NULL,
    "saved_from_context" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_invitees" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "invitee_id" TEXT NOT NULL,
    "first_invited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_invited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_invitations" INTEGER NOT NULL DEFAULT 1,
    "events_invited_to" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "user_invitees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "host_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category_id" TEXT,
    "location_name" TEXT,
    "location_lat" DOUBLE PRECISION,
    "location_lng" DOUBLE PRECISION,
    "event_date" DATE,
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "photo_urls" JSONB NOT NULL DEFAULT '[]',
    "interest_tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "capacity_limit" INTEGER,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "cancellation_reason" TEXT,
    "external_link" TEXT,
    "external_link_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_invitations" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "inviter_id" TEXT NOT NULL,
    "invitee_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "personal_message" TEXT,
    "decline_reason" TEXT,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_attendees" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagement_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "points_earned" INTEGER NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "engagement_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interest_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interest_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colleges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "colleges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_college_name_idx" ON "users"("college_name");

-- CreateIndex
CREATE INDEX "users_college_id_idx" ON "users"("college_id");

-- CreateIndex
CREATE INDEX "users_attractiveness_score_idx" ON "users"("attractiveness_score");

-- CreateIndex
CREATE INDEX "users_gender_idx" ON "users"("gender");

-- CreateIndex
CREATE INDEX "users_age_idx" ON "users"("age");

-- CreateIndex
CREATE UNIQUE INDEX "friendships_qr_code_token_key" ON "friendships"("qr_code_token");

-- CreateIndex
CREATE INDEX "friendships_user1_id_idx" ON "friendships"("user1_id");

-- CreateIndex
CREATE INDEX "friendships_user2_id_idx" ON "friendships"("user2_id");

-- CreateIndex
CREATE INDEX "friendships_status_idx" ON "friendships"("status");

-- CreateIndex
CREATE UNIQUE INDEX "friendships_user1_id_user2_id_key" ON "friendships"("user1_id", "user2_id");

-- CreateIndex
CREATE INDEX "saved_users_user_id_idx" ON "saved_users"("user_id");

-- CreateIndex
CREATE INDEX "saved_users_saved_user_id_idx" ON "saved_users"("saved_user_id");

-- CreateIndex
CREATE INDEX "saved_users_created_at_idx" ON "saved_users"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "saved_users_user_id_saved_user_id_key" ON "saved_users"("user_id", "saved_user_id");

-- CreateIndex
CREATE INDEX "user_invitees_user_id_idx" ON "user_invitees"("user_id");

-- CreateIndex
CREATE INDEX "user_invitees_invitee_id_idx" ON "user_invitees"("invitee_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_invitees_user_id_invitee_id_key" ON "user_invitees"("user_id", "invitee_id");

-- CreateIndex
CREATE INDEX "events_host_id_idx" ON "events"("host_id");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "events"("status");

-- CreateIndex
CREATE INDEX "events_event_date_idx" ON "events"("event_date");

-- CreateIndex
CREATE INDEX "events_category_id_idx" ON "events"("category_id");

-- CreateIndex
CREATE INDEX "events_is_public_idx" ON "events"("is_public");

-- CreateIndex
CREATE INDEX "event_invitations_invitee_id_idx" ON "event_invitations"("invitee_id");

-- CreateIndex
CREATE INDEX "event_invitations_inviter_id_idx" ON "event_invitations"("inviter_id");

-- CreateIndex
CREATE INDEX "event_invitations_event_id_idx" ON "event_invitations"("event_id");

-- CreateIndex
CREATE INDEX "event_invitations_status_idx" ON "event_invitations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "event_invitations_event_id_invitee_id_key" ON "event_invitations"("event_id", "invitee_id");

-- CreateIndex
CREATE INDEX "event_attendees_event_id_idx" ON "event_attendees"("event_id");

-- CreateIndex
CREATE INDEX "event_attendees_user_id_idx" ON "event_attendees"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_attendees_event_id_user_id_key" ON "event_attendees"("event_id", "user_id");

-- CreateIndex
CREATE INDEX "engagement_logs_user_id_idx" ON "engagement_logs"("user_id");

-- CreateIndex
CREATE INDEX "engagement_logs_action_type_idx" ON "engagement_logs"("action_type");

-- CreateIndex
CREATE INDEX "engagement_logs_created_at_idx" ON "engagement_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "event_categories_name_key" ON "event_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "interest_categories_name_key" ON "interest_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "colleges_name_key" ON "colleges"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cities_name_key" ON "cities"("name");

-- CreateIndex
CREATE INDEX "cities_name_idx" ON "cities"("name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_initiated_by_fkey" FOREIGN KEY ("initiated_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_users" ADD CONSTRAINT "saved_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_users" ADD CONSTRAINT "saved_users_saved_user_id_fkey" FOREIGN KEY ("saved_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invitees" ADD CONSTRAINT "user_invitees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invitees" ADD CONSTRAINT "user_invitees_invitee_id_fkey" FOREIGN KEY ("invitee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "event_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_invitations" ADD CONSTRAINT "event_invitations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_invitations" ADD CONSTRAINT "event_invitations_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_invitations" ADD CONSTRAINT "event_invitations_invitee_id_fkey" FOREIGN KEY ("invitee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_logs" ADD CONSTRAINT "engagement_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
