#!/bin/bash

# Create export directory
mkdir -p ai-marketplace-export

# Copy all important files and directories
cp -r client ai-marketplace-export/
cp -r server ai-marketplace-export/
cp -r shared ai-marketplace-export/
cp package.json ai-marketplace-export/
cp package-lock.json ai-marketplace-export/
cp tsconfig.json ai-marketplace-export/
cp vite.config.ts ai-marketplace-export/
cp tailwind.config.ts ai-marketplace-export/
cp postcss.config.js ai-marketplace-export/
cp components.json ai-marketplace-export/
cp drizzle.config.ts ai-marketplace-export/
cp README.md ai-marketplace-export/
cp .gitignore ai-marketplace-export/
cp replit.md ai-marketplace-export/

echo "Project exported to ai-marketplace-export directory"
echo "You can now zip this directory and upload to GitHub"