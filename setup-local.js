#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, copyFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up Agentic AI Agent Apps.com for local development...\n');

// Check if Node.js version is sufficient
try {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 18) {
    console.error('❌ Node.js version 18 or higher is required');
    console.error(`Current version: ${nodeVersion}`);
    process.exit(1);
  }
  
  console.log(`✅ Node.js version: ${nodeVersion}`);
} catch (error) {
  console.error('❌ Could not check Node.js version');
  process.exit(1);
}

// Check if .env file exists
if (!existsSync('.env')) {
  console.log('📝 Creating .env file from template...');
  
  if (existsSync('env.example')) {
    copyFileSync('env.example', '.env');
    console.log('✅ .env file created');
  } else {
    // Create basic .env file
    const envContent = `# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_marketplace

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Google OAuth (Optional - for Google login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Server Configuration
PORT=5000
NODE_ENV=development

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5
`;
    
    writeFileSync('.env', envContent);
    console.log('✅ .env file created with default values');
  }
  
  console.log('⚠️  Please edit .env file with your database credentials before continuing');
} else {
  console.log('✅ .env file already exists');
}

// Check if node_modules exists
if (!existsSync('node_modules')) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed');
  } catch (error) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies already installed');
}

// Check if PostgreSQL is running
console.log('🔍 Checking PostgreSQL connection...');
try {
  // Try to connect to PostgreSQL (this will fail if not running, which is expected)
  execSync('psql -h localhost -p 5432 -U postgres -d postgres -c "SELECT 1;"', { 
    stdio: 'ignore',
    env: { ...process.env, PGPASSWORD: 'password' }
  });
  console.log('✅ PostgreSQL is running');
} catch (error) {
  console.log('⚠️  PostgreSQL connection failed');
  console.log('   This is expected if PostgreSQL is not running or configured');
  console.log('   Please ensure PostgreSQL is running before starting the application');
}

console.log('\n🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Edit .env file with your database credentials');
console.log('2. Ensure PostgreSQL is running');
console.log('3. Run: npm run db:push');
console.log('4. Run: npm run dev');
console.log('5. Open http://localhost:5000 in your browser');
console.log('\nFor detailed instructions, see setup-local.md'); 