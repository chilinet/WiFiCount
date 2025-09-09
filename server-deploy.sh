#!/bin/bash

# WiFiCount Server Deployment Script
# Usage: ./server-deploy.sh [production|staging]

set -e

ENVIRONMENT=${1:-production}
PROJECT_NAME="wificount"
CONTAINER_NAME="${PROJECT_NAME}-app"
IMAGE_NAME="${PROJECT_NAME}:latest"

echo "🚀 Deploying WiFiCount to $ENVIRONMENT environment..."

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funktionen
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Prüfe ob Docker läuft
if ! docker info > /dev/null 2>&1; then
    log_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Prüfe ob .env Datei existiert
if [ ! -f ".env" ]; then
    log_error ".env file not found. Please create one with your configuration."
    exit 1
fi

# Lade Umgebungsvariablen
source .env

# Validiere erforderliche Variablen
if [ -z "$DATABASE_URL" ]; then
    log_error "DATABASE_URL is not set in .env file"
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    log_error "NEXTAUTH_SECRET is not set in .env file"
    exit 1
fi

log_info "Environment variables validated ✓"

# Stoppe existierenden Container
if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
    log_info "Stopping existing container..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# Baue neues Image
log_info "Building Docker image..."
docker build -t $IMAGE_NAME .

# Starte neuen Container
log_info "Starting new container..."

if [ "$ENVIRONMENT" = "production" ]; then
    # Produktions-Container mit allen Optimierungen
    docker run -d \
        --name $CONTAINER_NAME \
        --restart unless-stopped \
        -p 3000:3000 \
        --env-file .env \
        --memory="512m" \
        --cpus="0.5" \
        $IMAGE_NAME
else
    # Staging-Container
    docker run -d \
        --name $CONTAINER_NAME \
        --restart unless-stopped \
        -p 3001:3000 \
        --env-file .env \
        $IMAGE_NAME
fi

# Warte bis Container startet
log_info "Waiting for container to start..."
sleep 10

# Prüfe Container-Status
if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
    log_info "Container started successfully ✓"
    
    # Zeige Container-Status
    echo ""
    echo "📊 Container Status:"
    docker ps -f name=$CONTAINER_NAME --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    # Zeige Logs (letzte 20 Zeilen)
    echo ""
    echo "📋 Recent Logs:"
    docker logs --tail=20 $CONTAINER_NAME
    
    # Health Check
    log_info "Performing health check..."
    sleep 5
    
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_info "Health check passed ✓"
        echo ""
        echo "✅ Deployment successful!"
        echo "🌍 Application is available at: http://localhost:3000"
        echo ""
        echo "📋 Useful commands:"
        echo "  View logs: docker logs -f $CONTAINER_NAME"
        echo "  Stop: docker stop $CONTAINER_NAME"
        echo "  Restart: docker restart $CONTAINER_NAME"
        echo "  Shell access: docker exec -it $CONTAINER_NAME /bin/sh"
    else
        log_error "Health check failed. Check logs:"
        docker logs --tail=50 $CONTAINER_NAME
        exit 1
    fi
else
    log_error "Failed to start container"
    exit 1
fi
