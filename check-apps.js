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

async function checkApps() {
  try {
    console.log('Checking applications in database...\n');
    
    // Check applications table
    const appsResult = await pool.query('SELECT id, name, description, conversion_id FROM applications ORDER BY id');
    
    if (appsResult.rows.length === 0) {
      console.log('❌ No applications found in database');
      console.log('\nTo test the endpoint, you need to:');
      console.log('1. Add some test data to the applications table');
      console.log('2. Or use the n8n converter to generate an app');
    } else {
      console.log(`✅ Found ${appsResult.rows.length} application(s):`);
      appsResult.rows.forEach(app => {
        console.log(`   ID: ${app.id} | Name: ${app.name} | Has conversion: ${app.conversion_id ? 'Yes' : 'No'}`);
      });
      
      // Check workflow_conversions table
      const conversionsResult = await pool.query('SELECT id, workflow_name FROM workflow_conversions ORDER BY id');
      console.log(`\n📋 Found ${conversionsResult.rows.length} workflow conversion(s):`);
      conversionsResult.rows.forEach(conv => {
        console.log(`   ID: ${conv.id} | Name: ${conv.workflow_name}`);
      });
      
      console.log('\n🧪 To test the endpoint, use one of these URLs:');
      appsResult.rows.forEach(app => {
        if (app.conversion_id) {
          console.log(`   http://localhost:5000/api/applications/${app.id}/code`);
        }
      });
    }
    
  } catch (error) {
    console.error('Error checking apps:', error.message);
  } finally {
    await pool.end();
  }
}

checkApps(); 