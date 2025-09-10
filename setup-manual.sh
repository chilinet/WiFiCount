#!/bin/bash

# WiFiCount Manual Docker Setup (No Docker Compose)
echo "🚀 Setting up WiFiCount with Manual Docker Commands..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Get Docker API version
DOCKER_API_VERSION=$(docker version --format '{{.Server.APIVersion}}' 2>/dev/null || echo "unknown")
echo "📋 Docker API version: $DOCKER_API_VERSION"

# Determine MySQL version based on Docker API
if [[ "$DOCKER_API_VERSION" == "1.21" ]] || [[ "$DOCKER_API_VERSION" == "1.22" ]] || [[ "$DOCKER_API_VERSION" == "1.23" ]]; then
    echo "⚠️  Old Docker API detected, using MySQL 5.7"
    MYSQL_VERSION="5.7"
else
    echo "✅ Modern Docker API, using MySQL 8.0"
    MYSQL_VERSION="8.0"
fi

# Check if backup SQL file exists
if [ ! -f "backup_wepper.sql" ]; then
    echo "⚠️  Warning: backup_wepper.sql not found. Database will be empty."
    echo "   You can add your SQL dump later and restart the containers."
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker stop wificount-app wificount-mysql 2>/dev/null || true
docker rm wificount-app wificount-mysql 2>/dev/null || true

echo "📦 Building Docker image..."
if docker build -t wificount-app .; then
    echo "✅ Build successful"
else
    echo "❌ Build failed. Please check Dockerfile and try again."
    exit 1
fi

echo "🗄️  Starting MySQL database..."
if docker run -d \
    --name wificount-mysql \
    -e MYSQL_ROOT_PASSWORD=root \
    -e MYSQL_DATABASE=wificnt \
    -e MYSQL_USER=wificount \
    -e MYSQL_PASSWORD=wificount123 \
    -p 3307:3306 \
    -v /var/lib/mysql \
    -v $(pwd)/backup_wepper.sql:/docker-entrypoint-initdb.d/init.sql \
    mysql:$MYSQL_VERSION; then
    echo "✅ MySQL started successfully"
else
    echo "❌ Failed to start MySQL"
    exit 1
fi

echo "⏳ Waiting for MySQL to be ready..."
sleep 20

echo "🌐 Starting the application..."
if docker run -d \
    --name wificount-app \
    --link wificount-mysql:db \
    -e NODE_ENV=production \
    -e DATABASE_URL=mysql://wificount:wificount123@db:3306/wificnt \
    -e NEXTAUTH_URL=http://localhost:3000 \
    -e NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production \
    -e NEXT_PUBLIC_API_URL=https://cnradiusapi.chilinet.cloud \
    -e NEXT_PUBLIC_API_KEY=zk4SNSo3dDJfKYdt7LdhG44BBEiGBjPE \
    -p 3000:3000 \
    -v $(pwd)/uploads:/app/uploads \
    wificount-app; then
    echo "✅ Application started successfully"
else
    echo "❌ Failed to start application"
    exit 1
fi

echo "✅ Setup complete!"
echo ""
echo "🌍 Application is available at: http://localhost:3000"
echo "🗄️  MySQL database is available at: localhost:3307"
echo ""
echo "📋 Useful commands:"
echo "  View app logs: docker logs -f wificount-app"
echo "  View db logs: docker logs -f wificount-mysql"
echo "  Stop app: docker stop wificount-app"
echo "  Stop db: docker stop wificount-mysql"
echo "  Restart app: docker restart wificount-app"
echo "  Restart db: docker restart wificount-mysql"
echo "  Stop all: docker stop wificount-app wificount-mysql"
echo "  Remove all: docker rm wificount-app wificount-mysql"
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
echo "  2. Run: docker stop wificount-app wificount-mysql"
echo "  3. Run: docker rm wificount-app wificount-mysql"
echo "  4. Run: ./setup-manual.sh"
