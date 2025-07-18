#!/bin/bash

# Production Deployment Script
echo "🚀 Starting production deployment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy production.env.example to .env and fill in your values"
    exit 1
fi

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build completed successfully!"

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist folder not found after build!"
    exit 1
fi

echo "🎉 Deployment package ready!"
echo ""
echo "Next steps:"
echo "1. Upload the following files to your server:"
echo "   - dist/ folder"
echo "   - package.json"
echo "   - package-lock.json"
echo "   - .env file"
echo ""
echo "2. On your server, run:"
echo "   npm ci --only=production"
echo "   npm start"
echo ""
echo "3. Or use a platform like Railway/Render:"
echo "   - Connect your GitHub repo"
echo "   - Set environment variables"
echo "   - Deploy automatically" 