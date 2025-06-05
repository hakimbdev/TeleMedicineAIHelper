#!/bin/bash

# TeleMedicine AI Helper - Netlify Deployment Script

echo "🏥 Starting TeleMedicine AI Helper deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building the application..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed. dist directory not found."
    exit 1
fi

echo "✅ Build completed successfully!"
echo ""
echo "📋 Deployment Options:"
echo ""
echo "1. Manual Deployment:"
echo "   - Go to https://app.netlify.com"
echo "   - Drag and drop the 'dist' folder"
echo ""
echo "2. Git-based Deployment:"
echo "   - Push your code to GitHub/GitLab/Bitbucket"
echo "   - Connect your repository to Netlify"
echo "   - Set build command: npm run build"
echo "   - Set publish directory: dist"
echo ""
echo "3. Netlify CLI Deployment:"
echo "   - Install: npm install -g netlify-cli"
echo "   - Login: netlify login"
echo "   - Deploy: netlify deploy --prod --dir=dist"
echo ""
echo "🔧 Don't forget to set environment variables in Netlify:"
echo "   VITE_AGORA_APP_ID=your_agora_app_id_here"
echo ""
echo "🎉 Your TeleMedicine AI Helper is ready for deployment!"
