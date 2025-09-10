#!/bin/bash

# WiFiCount Docker Setup for Server (Docker Compose 1.x)
echo "🚀 Setting up WiFiCount with Docker on Server..."

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

# Get Docker Compose version
COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)
echo "📋 Docker Compose version: $COMPOSE_VERSION"

# Use Docker Compose 1.x format
COMPOSE_FILE="docker-compose-v1.yml"
echo "📁 Using compose file: $COMPOSE_FILE"

# Check if backup SQL file exists
if [ ! -f "backup_wepper.sql" ]; then
    echo "⚠️  Warning: backup_wepper.sql not found. Database will be empty."
    echo "   You can add your SQL dump later and restart the containers."
fi

echo "📦 Building Docker image..."
docker-compose -f $COMPOSE_FILE build

echo "🗄️  Starting MySQL database..."
docker-compose -f $COMPOSE_FILE up -d db

echo "⏳ Waiting for MySQL to be ready..."
sleep 15

echo "🌐 Starting the application..."
docker-compose -f $COMPOSE_FILE up -d app

echo "✅ Setup complete!"
echo ""
echo "🌍 Application is available at: http://localhost:3000"
echo "🗄️  MySQL database is available at: localhost:3307"
echo ""
echo "📋 Useful commands:"
echo "  View all logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "  View app logs: docker-compose -f $COMPOSE_FILE logs -f app"
echo "  View db logs: docker-compose -f $COMPOSE_FILE logs -f db"
echo "  Stop: docker-compose -f $COMPOSE_FILE down"
echo "  Restart: docker-compose -f $COMPOSE_FILE restart"
echo "  Rebuild: docker-compose -f $COMPOSE_FILE up --build -d"
echo ""
echo "🗄️  Database Connection:"
echo "  Host: localhost:3307"
echo "  Database: wificnt"
echo "  User: wificount"
echo "  Password: wificount123"
echo "  Root Password: root"
echo ""
echo "📝 To import your existing data:"
echo "  1. Copy your SQL dump to backup_wepper.sql"
echo "  2. Run: docker-compose -f $COMPOSE_FILE down"
echo "  3. Run: docker-compose -f $COMPOSE_FILE up -d"
