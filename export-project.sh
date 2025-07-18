#!/bin/bash

# Create export directory
mkdir -p agentic-ai-agent-apps-export

# Copy all important files and directories
cp -r client agentic-ai-agent-apps-export/
cp -r server agentic-ai-agent-apps-export/
cp -r shared agentic-ai-agent-apps-export/
cp package.json agentic-ai-agent-apps-export/
cp package-lock.json agentic-ai-agent-apps-export/
cp tsconfig.json agentic-ai-agent-apps-export/
cp vite.config.ts agentic-ai-agent-apps-export/
cp tailwind.config.ts agentic-ai-agent-apps-export/
cp postcss.config.js agentic-ai-agent-apps-export/
cp components.json agentic-ai-agent-apps-export/
cp drizzle.config.ts agentic-ai-agent-apps-export/
cp README.md agentic-ai-agent-apps-export/
cp .gitignore agentic-ai-agent-apps-export/
cp replit.md agentic-ai-agent-apps-export/

echo "Project exported to agentic-ai-agent-apps-export directory"
echo "You can now zip this directory and upload to GitHub"