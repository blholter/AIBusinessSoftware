import { Pool } from 'pg';

// Test database connection
async function testDatabase() {
  console.log('Testing Supabase database connection...');
  
  // You'll need to replace these with your actual Supabase credentials
  const connectionString = 'postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres';
  
  const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as db_version');
    console.log('✅ Database connected successfully!');
    console.log('Current time:', result.rows[0].current_time);
    console.log('Database version:', result.rows[0].db_version.split(' ')[0]);
    
    // Test if our tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user_profiles', 'applications', 'user_api_keys', 'sessions')
      ORDER BY table_name
    `);
    
    console.log('\n📋 Tables found:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Test RLS policies
    const policiesResult = await pool.query(`
      SELECT tablename, policyname, cmd
      FROM pg_policies 
      WHERE schemaname = 'public'
      AND tablename IN ('user_profiles', 'applications', 'user_api_keys', 'sessions')
      ORDER BY tablename, policyname
    `);
    
    console.log('\n🔒 RLS Policies found:');
    policiesResult.rows.forEach(row => {
      console.log(`  - ${row.tablename}: ${row.policyname} (${row.cmd})`);
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\nTo fix this:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Settings → Database → Copy the connection string');
    console.log('3. Replace the connectionString in this file');
  } finally {
    await pool.end();
  }
}

testDatabase(); 