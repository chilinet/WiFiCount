#!/bin/bash

# Simple WiFiCount Docker Setup for Docker Compose 1.x
echo "🚀 Setting up WiFiCount with Docker (Simple Mode)..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install it first."
    exit 1
fi

echo "📋 Using simple Docker Compose format for maximum compatibility"

# Check if .env file exists
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
    echo "⚠️ No .env file found. Please create one with your database connection details."
    echo "Example .env file:"
    echo "DATABASE_URL=mysql://username:password@host:port/database"
    echo "NEXTAUTH_URL=http://localhost:3000"
    echo "NEXTAUTH_SECRET=your-secret-key"
    echo "NEXT_PUBLIC_API_URL=https://cnradiusapi.chilinet.cloud"
    echo "NEXT_PUBLIC_API_KEY=your-api-key"
    exit 1
fi

echo "📦 Building Docker image..."
docker-compose -f docker-compose-simple.yml build

echo "🌐 Starting the application..."
docker-compose -f docker-compose-simple.yml up -d

echo "✅ Setup complete!"
echo ""
echo "🌍 Application is available at: http://localhost:3000"
echo ""
echo "📋 Useful commands:"
echo "  View logs: docker-compose -f docker-compose-simple.yml logs -f"
echo "  View app logs: docker-compose -f docker-compose-simple.yml logs -f app"
echo "  View db logs: docker-compose -f docker-compose-simple.yml logs -f db"
echo "  Stop: docker-compose -f docker-compose-simple.yml down"
echo "  Restart: docker-compose -f docker-compose-simple.yml restart"
echo "  Rebuild: docker-compose -f docker-compose-simple.yml up --build -d"
echo ""
echo "🗄️  Database:"
echo "  Host: localhost:3307"
echo "  Database: wificnt"
echo "  User: wificount"
echo "  Password: wificount123"
