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

async function seedTestData() {
  try {
    console.log('🌱 Seeding test data...\n');
    
    // First, create a test workflow conversion
    const conversionResult = await pool.query(`
      INSERT INTO workflow_conversions (user_id, workflow_name, original_workflow, workflow_analysis, generated_code, output_format, status)
      VALUES (1, 'Test Workflow', '{"nodes": []}', '{"analysis": "test"}', $1, 'react', 'completed')
      RETURNING id
    `, [`
import React, { useState } from 'react';

function TestApp() {
  const [count, setCount] = useState(0);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Test Generated App</h1>
      <p>This is a test app generated from a workflow!</p>
      <button 
        onClick={() => setCount(count + 1)}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Clicked {count} times
      </button>
    </div>
  );
}

render(<TestApp />);
    `]);
    
    const conversionId = conversionResult.rows[0].id;
    console.log(`✅ Created workflow conversion with ID: ${conversionId}`);
    
    // Then create a test application linked to the conversion
    const appResult = await pool.query(`
      INSERT INTO applications (name, description, category, icon, rating, downloads, conversion_id)
      VALUES ('Test Generated App', 'A test app generated from workflow', 'operations', '⚡', 5, 100, $1)
      RETURNING id
    `, [conversionId]);
    
    const appId = appResult.rows[0].id;
    console.log(`✅ Created application with ID: ${appId}`);
    
    console.log('\n🎉 Test data created successfully!');
    console.log('\n🧪 You can now test the endpoint with:');
    console.log(`   http://localhost:5000/api/applications/${appId}/code`);
    console.log('\n📋 Expected response:');
    console.log('   {"code": "/* React component code */"}');
    
  } catch (error) {
    console.error('❌ Error seeding test data:', error.message);
  } finally {
    await pool.end();
  }
}

seedTestData(); 