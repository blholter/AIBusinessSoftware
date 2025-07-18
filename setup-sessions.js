import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const createSessionsTable = `
-- Create sessions table for express-session with connect-pg-simple
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR NOT NULL COLLATE "default",
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
)
WITH (OIDS=FALSE);

-- Create primary key
ALTER TABLE sessions ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;

-- Create index on expire column (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_session_expire') THEN
        CREATE INDEX IDX_session_expire ON sessions (expire);
    END IF;
END $$;
`;

async function setupSessionsTable() {
  try {
    console.log('Setting up sessions table...');
    await pool.query(createSessionsTable);
    console.log('✅ Sessions table created successfully!');
  } catch (error) {
    console.error('❌ Error creating sessions table:', error.message);
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Sessions table already exists, this is fine.');
    }
  } finally {
    await pool.end();
  }
}

setupSessionsTable(); 