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
docker-compose build

echo "🌐 Starting the application..."
docker-compose up -d app

echo "✅ Setup complete!"
echo ""
echo "🌍 Application is available at: http://localhost:3000"
echo ""
echo "📋 Useful commands:"
echo "  View logs: docker-compose logs -f app"
echo "  Stop: docker-compose down"
echo "  Restart: docker-compose restart"
echo "  Rebuild: docker-compose up --build -d"
