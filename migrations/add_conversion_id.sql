-- Add conversion_id column to applications table
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "conversion_id" integer; 