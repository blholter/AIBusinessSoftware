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

async function createMissingTables() {
  try {
    console.log('🔧 Creating missing tables...\n');
    
    // Check if workflow_conversions table exists
    const checkConversions = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'workflow_conversions'
      );
    `);
    
    if (!checkConversions.rows[0].exists) {
      console.log('Creating workflow_conversions table...');
      await pool.query(`
        CREATE TABLE workflow_conversions (
          id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          user_id integer NOT NULL,
          workflow_name varchar NOT NULL,
          original_workflow jsonb NOT NULL,
          workflow_analysis jsonb NOT NULL,
          generated_code text,
          output_format varchar NOT NULL,
          status varchar DEFAULT 'pending',
          error_message text,
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        );
      `);
      console.log('✅ workflow_conversions table created');
    } else {
      console.log('✅ workflow_conversions table already exists');
    }
    
    // Check if other tables exist
    const tables = ['node_type_registry', 'workflow_templates'];
    for (const table of tables) {
      const checkTable = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        );
      `, [table]);
      
      if (!checkTable.rows[0].exists) {
        console.log(`Creating ${table} table...`);
        if (table === 'node_type_registry') {
          await pool.query(`
            CREATE TABLE node_type_registry (
              id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
              node_type varchar NOT NULL UNIQUE,
              node_name varchar NOT NULL,
              category varchar NOT NULL,
              description text,
              supported_formats jsonb NOT NULL,
              generator_code text,
              is_active boolean DEFAULT true,
              created_at timestamp DEFAULT now(),
              updated_at timestamp DEFAULT now()
            );
          `);
        } else if (table === 'workflow_templates') {
          await pool.query(`
            CREATE TABLE workflow_templates (
              id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
              name varchar NOT NULL,
              description text,
              template_type varchar NOT NULL,
              template_code text NOT NULL,
              node_types jsonb NOT NULL,
              is_active boolean DEFAULT true,
              created_at timestamp DEFAULT now(),
              updated_at timestamp DEFAULT now()
            );
          `);
        }
        console.log(`✅ ${table} table created`);
      } else {
        console.log(`✅ ${table} table already exists`);
      }
    }
    
    console.log('\n🎉 All tables are ready!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  } finally {
    await pool.end();
  }
}

createMissingTables(); 