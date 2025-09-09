#!/bin/bash

# Complete CentOS + Apache + Docker Deployment Script for WiFiCount
# Usage: ./centos-deploy.sh yourdomain.com

set -e

DOMAIN=${1}
if [ -z "$DOMAIN" ]; then
    echo "Usage: ./centos-deploy.sh yourdomain.com"
    exit 1
fi

echo "🚀 Complete CentOS + Apache + Docker Deployment for WiFiCount"
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

# 1. System aktualisieren
log_info "Updating CentOS system..."
sudo yum update -y

# 2. Docker installieren
log_info "Installing Docker..."

if ! command -v docker &> /dev/null; then
    # Docker Repository hinzufügen
    sudo yum install -y yum-utils
    sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
    
    # Docker installieren
    sudo yum install -y docker-ce docker-ce-cli containerd.io
    
    # Docker starten und aktivieren
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # Benutzer zur Docker-Gruppe hinzufügen
    sudo usermod -aG docker $USER
    
    log_info "Docker installed successfully ✓"
    log_warn "Please log out and back in for Docker group changes to take effect"
    log_warn "Or run: newgrp docker"
else
    log_info "Docker already installed ✓"
fi

# 3. Docker Compose installieren
log_info "Installing Docker Compose..."

if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
    log_info "Docker Compose installed successfully ✓"
else
    log_info "Docker Compose already installed ✓"
fi

# 4. Apache (httpd) installieren
log_info "Installing Apache (httpd)..."

if ! command -v httpd &> /dev/null; then
    sudo yum install -y httpd
    log_info "Apache installed successfully ✓"
else
    log_info "Apache already installed ✓"
fi

# 5. Apache Module aktivieren
log_info "Enabling Apache modules..."

# Module-Konfiguration erstellen
sudo tee /etc/httpd/conf.modules.d/00-wificount.conf > /dev/null <<EOF
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule headers_module modules/mod_headers.so
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule ssl_module modules/mod_ssl.so
LoadModule deflate_module modules/mod_deflate.so
EOF

# 6. Apache Virtual Host erstellen
log_info "Creating Apache Virtual Host..."

sudo tee /etc/httpd/conf.d/wificount.conf > /dev/null <<EOF
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
    SSLCertificateFile /etc/pki/tls/certs/localhost.crt
    SSLCertificateKeyFile /etc/pki/tls/private/localhost.key
    
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
    
    ErrorLog /var/log/httpd/wificount_error.log
    CustomLog /var/log/httpd/wificount_access.log combined
</VirtualHost>
EOF

# 7. Apache-Konfiguration testen
log_info "Testing Apache configuration..."
sudo httpd -t

# 8. Apache starten
sudo systemctl start httpd
sudo systemctl enable httpd

log_info "Apache configured and started ✓"

# 9. Prüfe .env Datei
if [ ! -f ".env" ]; then
    log_error ".env file not found. Please create one with your configuration."
    log_info "Example .env file:"
    echo "DATABASE_URL=mysql://username:password@host:port/database"
    echo "NEXTAUTH_URL=https://$DOMAIN"
    echo "NEXTAUTH_SECRET=your-secret-key"
    echo "NEXT_PUBLIC_API_URL=https://cnradiusapi.chilinet.cloud"
    echo "NEXT_PUBLIC_API_KEY=your-api-key"
    exit 1
fi

# 10. Docker Container deployen
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

# 11. Warte auf Container-Start
log_info "Waiting for container to start..."
sleep 15

# 12. Health Check
log_info "Performing health check..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log_info "Health check passed ✓"
else
    log_error "Health check failed. Check container logs:"
    docker logs wificount-app
    exit 1
fi

# 13. SSL Setup (optional)
read -p "Do you want to set up SSL with Let's Encrypt? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Setting up SSL with Let's Encrypt..."
    
    # EPEL Repository installieren
    sudo yum install -y epel-release
    
    # Certbot installieren
    sudo yum install -y certbot python3-certbot-apache
    
    # SSL-Zertifikat erstellen
    sudo certbot --apache -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    # Auto-Renewal testen
    sudo certbot renew --dry-run
    
    log_info "SSL certificate installed ✓"
fi

# 14. Firewall konfigurieren
log_info "Configuring firewall..."

if command -v firewall-cmd &> /dev/null; then
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --reload
    log_info "Firewall configured ✓"
else
    log_warn "firewall-cmd not found. Please configure firewall manually for ports 80 and 443"
fi

# 15. Finale Status-Übersicht
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
echo "  Restart Apache: sudo systemctl restart httpd"
echo "  Apache logs: sudo tail -f /var/log/httpd/wificount_access.log"
echo "  Apache errors: sudo tail -f /var/log/httpd/wificount_error.log"
echo "  Test Apache config: sudo httpd -t"
echo ""
echo "🔧 SSL Renewal:"
echo "  Test: sudo certbot renew --dry-run"
echo "  Manual: sudo certbot renew"
echo ""
echo "⚠️  Important: If you added your user to the docker group, please log out and back in"
