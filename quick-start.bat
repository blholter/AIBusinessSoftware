@echo off
echo 🚀 Quick Start Setup for Agentic AI Agent Apps.com
echo ========================================

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Docker is installed
    
    REM Check if Docker Compose is installed
    docker-compose --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Docker Compose is available
        
        echo 🐘 Starting PostgreSQL with Docker Compose...
        docker-compose up -d postgres
        if %errorlevel% equ 0 (
            echo ✅ PostgreSQL started successfully
            echo ⏳ Waiting for database to be ready...
            timeout /t 5 /nobreak >nul
        ) else (
            echo ❌ Failed to start PostgreSQL
            pause
            exit /b 1
        )
    ) else (
        echo ⚠️  Docker Compose not found, using Docker directly...
        echo 🐘 Starting PostgreSQL with Docker...
        docker run --name agentic-ai-agent-apps-db -e POSTGRES_DB=agentic_ai_agent_apps -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15
        if %errorlevel% equ 0 (
            echo ✅ PostgreSQL started successfully
            echo ⏳ Waiting for database to be ready...
            timeout /t 5 /nobreak >nul
        ) else (
            echo ❌ Failed to start PostgreSQL
            pause
            exit /b 1
        )
    )
) else (
    echo ⚠️  Docker not found
    echo    Please install Docker or set up PostgreSQL manually
    echo    See setup-local.md for manual setup instructions
    pause
    exit /b 1
)

REM Run the setup script
echo 🔧 Running setup script...
node setup-local.js
if %errorlevel% equ 0 (
    echo ✅ Setup script completed
) else (
    echo ❌ Setup script failed
    pause
    exit /b 1
)

REM Run database migrations
echo 🗄️  Setting up database...
npm run db:push
if %errorlevel% equ 0 (
    echo ✅ Database setup completed
) else (
    echo ❌ Database setup failed
    pause
    exit /b 1
)

REM Optional: Seed with test data
set /p seed_data="🤔 Would you like to seed the database with test data? (y/N): "
if /i "%seed_data%"=="y" (
    echo 🌱 Seeding database with test data...
    node seed-test-data.js
    if %errorlevel% equ 0 (
        echo ✅ Test data seeded successfully
    ) else (
        echo ❌ Failed to seed test data
    )
)

echo.
echo 🎉 Setup complete!
echo ==================
echo.
echo Next steps:
echo 1. Start the development server: npm run dev
echo 2. Open http://localhost:5000 in your browser
echo.
echo To stop the database:
docker-compose --version >nul 2>&1
if %errorlevel% equ 0 (
    echo    docker-compose down
) else (
    echo    docker stop agentic-ai-agent-apps-db
)
echo.
echo Happy coding! 🚀
pause 