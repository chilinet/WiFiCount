#!/bin/bash

# Complete Apache + Docker Deployment Script for WiFiCount
# Usage: ./apache-deploy.sh yourdomain.com

set -e

DOMAIN=${1}
if [ -z "$DOMAIN" ]; then
    echo "Usage: ./apache-deploy.sh yourdomain.com"
    exit 1
fi

echo "🚀 Complete Apache + Docker Deployment for WiFiCount"
echo "Domain: $DOMAIN"
echo ""

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Prüfe Voraussetzungen
log_info "Checking prerequisites..."

# Prüfe ob Docker läuft
if ! docker info > /dev/null 2>&1; then
    log_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Prüfe ob .env existiert
if [ ! -f ".env" ]; then
    log_error ".env file not found. Please create one with your configuration."
    exit 1
fi

# 2. Apache installieren und konfigurieren
log_info "Setting up Apache..."

if ! command -v apache2 &> /dev/null; then
    log_info "Installing Apache..."
    sudo apt update
    sudo apt install -y apache2
fi

# Module aktivieren
sudo a2enmod proxy proxy_http headers rewrite ssl deflate

# 3. Apache Virtual Host erstellen
log_info "Creating Apache Virtual Host..."

sudo tee /etc/apache2/sites-available/wificount.conf > /dev/null <<EOF
<VirtualHost *:80>
    ServerName $DOMAIN
    ServerAlias www.$DOMAIN
    
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
</VirtualHost>

<VirtualHost *:443>
    ServerName $DOMAIN
    ServerAlias www.$DOMAIN
    
    # Temporary SSL (will be updated by Let's Encrypt)
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/ssl-cert-snakeoil.pem
    SSLCertificateKeyFile /etc/ssl/private/ssl-cert-snakeoil.key
    
    # Security Headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    
    # Compression
    <Location />
        SetOutputFilter DEFLATE
        SetEnvIfNoCase Request_URI \.(?:gif|jpe?g|png)$ no-gzip dont-vary
        SetEnvIfNoCase Request_URI \.(?:exe|t?gz|zip|bz2|sit|rar)$ no-gzip dont-vary
    </Location>
    
    # Proxy Configuration
    ProxyPreserveHost On
    ProxyRequests Off
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    # WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) "ws://localhost:3000/\$1" [P,L]
    
    # Static files caching
    <LocationMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
        ProxyPass http://localhost:3000
        ProxyPassReverse http://localhost:3000
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
        Header set Cache-Control "public, immutable"
    </LocationMatch>
    
    ErrorLog \${APACHE_LOG_DIR}/wificount_error.log
    CustomLog \${APACHE_LOG_DIR}/wificount_access.log combined
</VirtualHost>
EOF

# Site aktivieren
sudo a2ensite wificount.conf
sudo a2dissite 000-default.conf

# Apache-Konfiguration testen
sudo apache2ctl configtest

# Apache starten
sudo systemctl restart apache2
sudo systemctl enable apache2

log_info "Apache configured successfully ✓"

# 4. Docker Container deployen
log_info "Deploying Docker container..."

# Stoppe existierenden Container
if docker ps -q -f name=wificount-app | grep -q .; then
    log_info "Stopping existing container..."
    docker stop wificount-app
    docker rm wificount-app
fi

# Baue und starte Container
docker build -t wificount:latest .
docker run -d \
    --name wificount-app \
    --restart unless-stopped \
    -p 3000:3000 \
    --env-file .env \
    wificount:latest

log_info "Docker container deployed ✓"

# 5. Warte auf Container-Start
log_info "Waiting for container to start..."
sleep 15

# 6. Health Check
log_info "Performing health check..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log_info "Health check passed ✓"
else
    log_error "Health check failed. Check container logs:"
    docker logs wificount-app
    exit 1
fi

# 7. SSL Setup (optional)
read -p "Do you want to set up SSL with Let's Encrypt? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Setting up SSL with Let's Encrypt..."
    
    # Certbot installieren
    sudo apt install -y certbot python3-certbot-apache
    
    # SSL-Zertifikat erstellen
    sudo certbot --apache -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    # Auto-Renewal testen
    sudo certbot renew --dry-run
    
    log_info "SSL certificate installed ✓"
fi

# 8. Finale Status-Übersicht
echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "🌍 Application URLs:"
echo "  HTTP:  http://$DOMAIN"
echo "  HTTPS: https://$DOMAIN"
echo ""
echo "📊 Container Status:"
docker ps -f name=wificount-app --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "📋 Management Commands:"
echo "  View logs: docker logs -f wificount-app"
echo "  Restart container: docker restart wificount-app"
echo "  Restart Apache: sudo systemctl restart apache2"
echo "  Apache logs: sudo tail -f /var/log/apache2/wificount_access.log"
echo "  Apache errors: sudo tail -f /var/log/apache2/wificount_error.log"
echo ""
echo "🔧 SSL Renewal:"
echo "  Test: sudo certbot renew --dry-run"
echo "  Manual: sudo certbot renew"
