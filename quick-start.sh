#!/bin/bash

echo "🚀 Quick Start Setup for Agentic AI Agent Apps.com"
echo "========================================"

# Check if Docker is installed
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    
    # Check if Docker Compose is installed
    if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
        echo "✅ Docker Compose is available"
        
        echo "🐘 Starting PostgreSQL with Docker Compose..."
        if docker-compose up -d postgres; then
            echo "✅ PostgreSQL started successfully"
            echo "⏳ Waiting for database to be ready..."
            sleep 5
        else
            echo "❌ Failed to start PostgreSQL"
            exit 1
        fi
    else
        echo "⚠️  Docker Compose not found, using Docker directly..."
        echo "🐘 Starting PostgreSQL with Docker..."
        if docker run --name agentic-ai-agent-apps-db \
  -e POSTGRES_DB=agentic_ai_agent_apps \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15; then
            echo "✅ PostgreSQL started successfully"
            echo "⏳ Waiting for database to be ready..."
            sleep 5
        else
            echo "❌ Failed to start PostgreSQL"
            exit 1
        fi
    fi
else
    echo "⚠️  Docker not found"
    echo "   Please install Docker or set up PostgreSQL manually"
    echo "   See setup-local.md for manual setup instructions"
    exit 1
fi

# Run the setup script
echo "🔧 Running setup script..."
if node setup-local.js; then
    echo "✅ Setup script completed"
else
    echo "❌ Setup script failed"
    exit 1
fi

# Run database migrations
echo "🗄️  Setting up database..."
if npm run db:push; then
    echo "✅ Database setup completed"
else
    echo "❌ Database setup failed"
    exit 1
fi

# Optional: Seed with test data
read -p "🤔 Would you like to seed the database with test data? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database with test data..."
    if node seed-test-data.js; then
        echo "✅ Test data seeded successfully"
    else
        echo "❌ Failed to seed test data"
    fi
fi

echo ""
echo "🎉 Setup complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Start the development server: npm run dev"
echo "2. Open http://localhost:5000 in your browser"
echo ""
echo "To stop the database:"
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    echo "   docker-compose down"
else
    echo "   docker stop agentic-ai-agent-apps-db"
fi
echo ""
echo "Happy coding! 🚀" 