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

async function cleanupDuplicates() {
  try {
    console.log('🧹 Cleaning up duplicate apps...\n');
    
    // Check what apps exist
    const appsResult = await pool.query('SELECT id, name, conversion_id FROM applications ORDER BY id');
    console.log('Current apps:');
    appsResult.rows.forEach(app => {
      console.log(`  ID: ${app.id} | Name: ${app.name} | Conversion ID: ${app.conversion_id}`);
    });
    
    // Remove app with ID 2 (the duplicate)
    if (appsResult.rows.length > 1) {
      console.log('\nRemoving duplicate app (ID: 2)...');
      await pool.query('DELETE FROM applications WHERE id = 2');
      
      // Also remove the associated workflow conversion
      const conversionId = appsResult.rows.find(app => app.id === 2)?.conversion_id;
      if (conversionId) {
        console.log(`Removing workflow conversion (ID: ${conversionId})...`);
        await pool.query('DELETE FROM workflow_conversions WHERE id = $1', [conversionId]);
      }
      
      console.log('✅ Duplicate removed');
    } else {
      console.log('✅ No duplicates found');
    }
    
    // Show final state
    const finalAppsResult = await pool.query('SELECT id, name, conversion_id FROM applications ORDER BY id');
    console.log('\nFinal apps:');
    finalAppsResult.rows.forEach(app => {
      console.log(`  ID: ${app.id} | Name: ${app.name} | Conversion ID: ${app.conversion_id}`);
    });
    
  } catch (error) {
    console.error('❌ Error cleaning up duplicates:', error.message);
  } finally {
    await pool.end();
  }
}

cleanupDuplicates(); 