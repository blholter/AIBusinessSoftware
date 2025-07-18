# 🚀 Local Development Setup

Get your Agentic AI Agent Apps.com running locally in minutes!

## Quick Start (Recommended)

### Option 1: Automated Setup (Windows)
```bash
quick-start.bat
```

### Option 2: Automated Setup (Mac/Linux)
```bash
chmod +x quick-start.sh
./quick-start.sh
```

### Option 3: Manual Setup
```bash
# 1. Start PostgreSQL with Docker
docker-compose up -d postgres

# 2. Run setup script
npm run setup

# 3. Set up database
npm run db:push

# 4. Start development server
npm run dev
```

## What You Need

- **Node.js** (v18+)
- **Docker** (for PostgreSQL)
- **Git**

## Access Your App

Once running, open: **http://localhost:5000**

## Database Management

- **Start:** `docker-compose up -d postgres`
- **Stop:** `docker-compose down`
- **View logs:** `docker-compose logs postgres`

## Useful Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:push      # Update database schema
npm run check        # Check TypeScript
```

## Troubleshooting

- **Port 5000 in use?** Change `PORT` in `.env`
- **Database connection failed?** Ensure PostgreSQL is running
- **Dependencies issues?** Run `npm install`

## Detailed Guide

For complete setup instructions, see [setup-local.md](setup-local.md) 