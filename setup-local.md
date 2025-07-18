# Local Development Setup Guide

This guide will help you set up the Agentic AI Agent Apps.com application for local development.

## Prerequisites

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **PostgreSQL** (v12 or higher)
   - **Windows**: Download from https://www.postgresql.org/download/windows/
   - **macOS**: `brew install postgresql`
   - **Linux**: `sudo apt-get install postgresql postgresql-contrib`

3. **Git** (for cloning the repository)

## Step 1: Clone and Install Dependencies

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd agentic-ai-agent-apps

# Install dependencies
npm install
```

## Step 2: Set Up PostgreSQL Database

### Option A: Using Docker Compose (Recommended)

If you have Docker and Docker Compose installed:

```bash
# Start PostgreSQL container
docker-compose up -d postgres

# The database will be available at:
# Host: localhost
# Port: 5432
# Database: agentic_ai_agent_apps
# Username: postgres
# Password: password

# To stop the database:
docker-compose down

# To view logs:
docker-compose logs postgres
```

### Option B: Using Docker (Alternative)

If you have Docker installed but prefer not to use Docker Compose:

```bash
# Start PostgreSQL container
docker run --name agentic-ai-agent-apps-db \
  -e POSTGRES_DB=agentic_ai_agent_apps \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# The database will be available at:
# Host: localhost
# Port: 5432
# Database: agentic_ai_agent_apps
# Username: postgres
# Password: password
```

### Option C: Local PostgreSQL Installation

1. **Create Database:**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE agentic_ai_agent_apps;
   
   # Create user (optional)
   CREATE USER ai_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE agentic_ai_agent_apps TO ai_user;
   
   # Exit
   \q
   ```

## Step 3: Environment Configuration

1. **Copy the example environment file:**
   ```bash
   cp env.example .env
   ```

2. **Edit `.env` file with your database credentials:**
   ```bash
   # For Docker setup:
   DATABASE_URL=postgresql://postgres:password@localhost:5432/agentic_ai_agent_apps
   
   # For local PostgreSQL:
   DATABASE_URL=postgresql://ai_user:your_password@localhost:5432/agentic_ai_agent_apps
   
   # Generate a secure session secret:
   SESSION_SECRET=your-super-secret-session-key-change-this-in-production
   
   # Optional: Google OAuth (for Google login feature)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

## Step 4: Database Setup

```bash
# Run database migrations
npm run db:push

# (Optional) Seed with test data
node seed-test-data.js
```

## Step 5: Start Development Server

```bash
# Start the development server
npm run dev
```

The application will be available at: **http://localhost:5000**

## Step 6: Verify Installation

1. Open your browser and navigate to `http://localhost:5000`
2. You should see the Agentic AI Agent Apps.com landing page
3. Try registering a new account
4. Test the login functionality

## Troubleshooting

### Common Issues:

1. **Database Connection Error:**
   - Verify PostgreSQL is running
   - Check your `DATABASE_URL` in `.env`
   - Ensure the database exists

2. **Port Already in Use:**
   - Change the `PORT` in your `.env` file
   - Or kill the process using port 5000

3. **Dependencies Issues:**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **TypeScript Errors:**
   ```bash
   # Check for TypeScript issues
   npm run check
   ```

### Useful Commands:

```bash
# Check current code in database
node check-current-code.js

# Check applications
node check-apps.js

# Check users
node check-users.sql

# Clean up database duplicates
node cleanup-duplicates.js
```

## Development Workflow

1. **Start the server:** `npm run dev`
2. **Make changes** to your code
3. **View changes** at `http://localhost:5000`
4. **Database changes:** Run `npm run db:push`

## Production Build

When ready for production:

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Security Notes

- Never commit your `.env` file to version control
- Use strong, unique passwords for your database
- Generate a secure `SESSION_SECRET` for production
- Consider using environment-specific configuration files

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the logs in your terminal
3. Ensure all prerequisites are installed correctly
4. Verify your database connection 