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

async function fixReactLiveCode() {
  try {
    console.log('🔧 Fixing code for react-live...\n');
    
    // Get the workflow conversion ID for app ID 1
    const appResult = await pool.query('SELECT conversion_id FROM applications WHERE id = 1');
    
    if (appResult.rows.length === 0) {
      console.log('❌ App with ID 1 not found');
      return;
    }
    
    const conversionId = appResult.rows[0].conversion_id;
    console.log(`Found conversion ID: ${conversionId}`);
    
    // Update the generated code for noInline mode
    const correctCode = `
import React, { useState } from 'react';

function App() {
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

render(<App />);
    `.trim();
    
    // Update the workflow conversion
    await pool.query(
      'UPDATE workflow_conversions SET generated_code = $1 WHERE id = $2',
      [correctCode, conversionId]
    );
    
    console.log('✅ Updated code for react-live inline mode');
    console.log('\n🧪 You can now test the endpoint with:');
    console.log('   http://localhost:5000/api/applications/1/code');
    console.log('   or visit: http://localhost:5000/app-runner/1');
    
  } catch (error) {
    console.error('❌ Error updating code:', error.message);
  } finally {
    await pool.end();
  }
}

fixReactLiveCode(); 