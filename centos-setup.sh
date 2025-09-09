#!/bin/bash

# CentOS Setup Script for WiFiCount
# Usage: ./centos-setup.sh yourdomain.com

set -e

DOMAIN=${1}
if [ -z "$DOMAIN" ]; then
    echo "Usage: ./centos-setup.sh yourdomain.com"
    exit 1
fi

echo "🔧 Setting up WiFiCount on CentOS for $DOMAIN..."

# Prüfe ob httpd (Apache) installiert ist
if ! command -v httpd &> /dev/null; then
    echo "Installing Apache (httpd)..."
    sudo yum update -y
    sudo yum install -y httpd
fi

# Prüfe ob Docker installiert ist
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo yum install -y yum-utils
    sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
    sudo yum install -y docker-ce docker-ce-cli containerd.io
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
    echo "Please log out and back in for Docker group changes to take effect"
fi

# Prüfe ob Docker Compose installiert ist
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
fi

# Starte httpd
sudo systemctl start httpd
sudo systemctl enable httpd

# Erstelle Apache Virtual Host Konfiguration
sudo tee /etc/httpd/conf.d/wificount.conf > /dev/null <<EOF
<VirtualHost *:80>
    ServerName $DOMAIN
    ServerAlias www.$DOMAIN
    
    # Redirect to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
</VirtualHost>

<VirtualHost *:443>
    ServerName $DOMAIN
    ServerAlias www.$DOMAIN
    DocumentRoot /var/www/html
    
    # SSL Configuration (will be updated by Let's Encrypt)
    SSLEngine on
    SSLCertificateFile /etc/pki/tls/certs/localhost.crt
    SSLCertificateKeyFile /etc/pki/tls/private/localhost.key
    
    # Security Headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "no-referrer-when-downgrade"
    Header always set Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    
    # Compression
    LoadModule deflate_module modules/mod_deflate.so
    <Location />
        SetOutputFilter DEFLATE
        SetEnvIfNoCase Request_URI \
            \.(?:gif|jpe?g|png)$ no-gzip dont-vary
        SetEnvIfNoCase Request_URI \
            \.(?:exe|t?gz|zip|bz2|sit|rar)$ no-gzip dont-vary
    </Location>
    
    # Proxy Configuration
    ProxyPreserveHost On
    ProxyRequests Off
    
    # Main application proxy
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    # WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) "ws://localhost:3000/\$1" [P,L]
    
    # Health check endpoint
    <Location /health>
        ProxyPass http://localhost:3000/health
        ProxyPassReverse http://localhost:3000/health
    </Location>
    
    # Static files caching
    <LocationMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
        ProxyPass http://localhost:3000
        ProxyPassReverse http://localhost:3000
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
        Header set Cache-Control "public, immutable"
    </LocationMatch>
    
    # Logging
    ErrorLog /var/log/httpd/wificount_error.log
    CustomLog /var/log/httpd/wificount_access.log combined
</VirtualHost>
EOF

# Aktiviere erforderliche Module
sudo tee /etc/httpd/conf.modules.d/00-wificount.conf > /dev/null <<EOF
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule headers_module modules/mod_headers.so
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule ssl_module modules/mod_ssl.so
LoadModule deflate_module modules/mod_deflate.so
EOF

# Teste Apache-Konfiguration
sudo httpd -t

# Starte/Neustarte Apache
sudo systemctl restart httpd

echo "✅ Apache configuration created and activated"
echo "🌍 Site is available at: http://$DOMAIN"

# SSL Setup mit Let's Encrypt
read -p "Do you want to set up SSL with Let's Encrypt? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔒 Setting up SSL with Let's Encrypt..."
    
    # Installiere Certbot für CentOS
    sudo yum install -y epel-release
    sudo yum install -y certbot python3-certbot-apache
    
    # Erstelle SSL-Zertifikat
    sudo certbot --apache -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    # Teste Auto-Renewal
    sudo certbot renew --dry-run
    
    echo "✅ SSL certificate installed"
    echo "🔒 Site is now available at: https://$DOMAIN"
fi

echo ""
echo "📋 CentOS management commands:"
echo "  Test config: sudo httpd -t"
echo "  Reload: sudo systemctl reload httpd"
echo "  Restart: sudo systemctl restart httpd"
echo "  Status: sudo systemctl status httpd"
echo "  Error logs: sudo tail -f /var/log/httpd/wificount_error.log"
echo "  Access logs: sudo tail -f /var/log/httpd/wificount_access.log"
