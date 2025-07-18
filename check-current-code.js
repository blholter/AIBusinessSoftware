import { Pool } from 'pg';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL must be set");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkCurrentCode() {
  try {
    console.log('🔍 Checking current code in database...\n');
    
    // Get the workflow conversion for app ID 1
    const result = await pool.query(`
      SELECT wc.generated_code 
      FROM workflow_conversions wc 
      JOIN applications a ON wc.id = a.conversion_id 
      WHERE a.id = 1
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No code found for app ID 1');
      return;
    }
    
    const code = result.rows[0].generated_code;
    console.log('Current code:');
    console.log('---START OF CODE---');
    console.log(code);
    console.log('---END OF CODE---');
    
  } catch (error) {
    console.error('❌ Error checking code:', error.message);
  } finally {
    await pool.end();
  }
}

checkCurrentCode(); 