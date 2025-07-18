import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const dropIndexSQL = 'DROP INDEX IF EXISTS "IDX_session_expire";';

async function dropSessionIndex() {
  try {
    console.log('Dropping IDX_session_expire index if it exists...');
    await pool.query(dropIndexSQL);
    console.log('✅ Index dropped (or did not exist).');
  } catch (error) {
    console.error('❌ Error dropping index:', error.message);
  } finally {
    await pool.end();
  }
}

dropSessionIndex(); 