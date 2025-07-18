-- Fix the IDX_session_expire index issue
DROP INDEX IF EXISTS "IDX_session_expire";

-- Also drop the sessions table if it exists and recreate it cleanly
DROP TABLE IF EXISTS sessions CASCADE; 