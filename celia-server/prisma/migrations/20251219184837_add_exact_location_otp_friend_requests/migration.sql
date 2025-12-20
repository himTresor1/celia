-- Add exactLocation to events table
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "exact_location" TEXT;

-- Add emailVerified to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN NOT NULL DEFAULT false;

-- Create otps table
CREATE TABLE IF NOT EXISTS "otps" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_at" TIMESTAMP(3),

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- Create indexes for otps
CREATE INDEX IF NOT EXISTS "otps_email_idx" ON "otps"("email");
CREATE INDEX IF NOT EXISTS "otps_code_idx" ON "otps"("code");
CREATE INDEX IF NOT EXISTS "otps_type_idx" ON "otps"("type");
CREATE INDEX IF NOT EXISTS "otps_expires_at_idx" ON "otps"("expires_at");
