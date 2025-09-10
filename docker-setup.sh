#!/bin/bash

# WiFiCount Docker Setup Script (without MySQL)
echo "🚀 Setting up WiFiCount with Docker..."

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

# Check docker-compose version
COMPOSE_VERSION=$(docker-compose --version | grep -oE '[0-9]+\.[0-9]+' | head -1)
echo "📋 Docker Compose version: $COMPOSE_VERSION"

# Try modern format first, fallback to legacy
echo "🔄 Testing Docker Compose format compatibility..."

# Test if modern format works
if docker-compose -f docker-compose.yml config > /dev/null 2>&1; then
    echo "✅ Modern format works, using docker-compose.yml"
    COMPOSE_FILE="docker-compose.yml"
else
    echo "⚠️  Modern format failed, using Docker Compose 1.x format"
    COMPOSE_FILE="docker-compose-v1.yml"
fi

echo "📁 Using compose file: $COMPOSE_FILE"

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
docker-compose -f $COMPOSE_FILE build

echo "🌐 Starting the application..."
docker-compose -f $COMPOSE_FILE up -d

echo "✅ Setup complete!"
echo ""
echo "🌍 Application is available at: http://localhost:3000"
echo ""
echo "📋 Useful commands:"
echo "  View logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "  View app logs: docker-compose -f $COMPOSE_FILE logs -f app"
echo "  View db logs: docker-compose -f $COMPOSE_FILE logs -f db"
echo "  Stop: docker-compose -f $COMPOSE_FILE down"
echo "  Restart: docker-compose -f $COMPOSE_FILE restart"
echo "  Rebuild: docker-compose -f $COMPOSE_FILE up --build -d"
echo ""
echo "🗄️  Database:"
echo "  Host: localhost:3307"
echo "  Database: wificnt"
echo "  User: wificount"
echo "  Password: wificount123"
