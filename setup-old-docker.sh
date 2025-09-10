#!/bin/bash

# WiFiCount Docker Setup for Old Docker Versions
echo "🚀 Setting up WiFiCount with Docker (Old Version Support)..."

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

# Get Docker API version
DOCKER_API_VERSION=$(docker version --format '{{.Server.APIVersion}}' 2>/dev/null || echo "unknown")
echo "📋 Docker API version: $DOCKER_API_VERSION"

# Determine which compose file to use based on Docker API version
if [[ "$DOCKER_API_VERSION" == "1.21" ]] || [[ "$DOCKER_API_VERSION" == "1.22" ]] || [[ "$DOCKER_API_VERSION" == "1.23" ]]; then
    echo "⚠️  Old Docker API detected, using MySQL 5.7 and old format"
    COMPOSE_FILE="docker-compose-old.yml"
    MYSQL_VERSION="5.7"
else
    echo "✅ Modern Docker API, using MySQL 8.0"
    COMPOSE_FILE="docker-compose-v1.yml"
    MYSQL_VERSION="8.0"
fi

echo "📁 Using compose file: $COMPOSE_FILE"
echo "🗄️  MySQL version: $MYSQL_VERSION"

# Check if backup SQL file exists
if [ ! -f "backup_wepper.sql" ]; then
    echo "⚠️  Warning: backup_wepper.sql not found. Database will be empty."
    echo "   You can add your SQL dump later and restart the containers."
fi

echo "📦 Building Docker image..."
if docker-compose -f $COMPOSE_FILE build; then
    echo "✅ Build successful"
else
    echo "❌ Build failed. Trying alternative approach..."
    
    # Try building without compose
    echo "🔨 Building image manually..."
    docker build -t wificount-app .
    
    if [ $? -eq 0 ]; then
        echo "✅ Manual build successful"
    else
        echo "❌ Manual build also failed. Please check Docker installation."
        exit 1
    fi
fi

echo "🗄️  Starting MySQL database..."
if docker-compose -f $COMPOSE_FILE up -d db; then
    echo "✅ MySQL started successfully"
else
    echo "❌ Failed to start MySQL with compose. Trying manual approach..."
    
    # Manual MySQL start
    docker run -d \
        --name wificount-mysql \
        -e MYSQL_ROOT_PASSWORD=root \
        -e MYSQL_DATABASE=wificnt \
        -e MYSQL_USER=wificount \
        -e MYSQL_PASSWORD=wificount123 \
        -p 3307:3306 \
        -v /var/lib/mysql \
        -v $(pwd)/backup_wepper.sql:/docker-entrypoint-initdb.d/init.sql \
        mysql:$MYSQL_VERSION
    
    if [ $? -eq 0 ]; then
        echo "✅ MySQL started manually"
    else
        echo "❌ Failed to start MySQL manually"
        exit 1
    fi
fi

echo "⏳ Waiting for MySQL to be ready..."
sleep 20

echo "🌐 Starting the application..."
if docker-compose -f $COMPOSE_FILE up -d app; then
    echo "✅ Application started successfully"
else
    echo "❌ Failed to start app with compose. Trying manual approach..."
    
    # Manual app start
    docker run -d \
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
        wificount-app
    
    if [ $? -eq 0 ]; then
        echo "✅ Application started manually"
    else
        echo "❌ Failed to start application manually"
        exit 1
    fi
fi

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
