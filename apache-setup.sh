#!/bin/bash

# Apache Setup Script for WiFiCount
# Usage: ./apache-setup.sh yourdomain.com

set -e

DOMAIN=${1}
if [ -z "$DOMAIN" ]; then
    echo "Usage: ./apache-setup.sh yourdomain.com"
    exit 1
fi

echo "🔧 Setting up Apache for WiFiCount on $DOMAIN..."

# Prüfe ob Apache installiert ist
if ! command -v apache2 &> /dev/null; then
    echo "Installing Apache..."
    sudo apt update
    sudo apt install -y apache2
fi

# Aktiviere erforderliche Module
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod deflate

# Erstelle Apache Virtual Host Konfiguration
sudo tee /etc/apache2/sites-available/wificount.conf > /dev/null <<EOF
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
    SSLCertificateFile /etc/ssl/certs/ssl-cert-snakeoil.pem
    SSLCertificateKeyFile /etc/ssl/private/ssl-cert-snakeoil.key
    
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
    ErrorLog \${APACHE_LOG_DIR}/wificount_error.log
    CustomLog \${APACHE_LOG_DIR}/wificount_access.log combined
</VirtualHost>
EOF

# Aktiviere Site
sudo a2ensite wificount.conf

# Deaktiviere default site
sudo a2dissite 000-default.conf

# Teste Apache-Konfiguration
sudo apache2ctl configtest

# Starte/Neustarte Apache
sudo systemctl restart apache2
sudo systemctl enable apache2

echo "✅ Apache configuration created and activated"
echo "🌍 Site is available at: http://$DOMAIN"

# SSL Setup mit Let's Encrypt
read -p "Do you want to set up SSL with Let's Encrypt? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔒 Setting up SSL with Let's Encrypt..."
    
    # Installiere Certbot für Apache
    sudo apt install -y certbot python3-certbot-apache
    
    # Erstelle SSL-Zertifikat
    sudo certbot --apache -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    # Teste Auto-Renewal
    sudo certbot renew --dry-run
    
    echo "✅ SSL certificate installed"
    echo "🔒 Site is now available at: https://$DOMAIN"
fi

echo ""
echo "📋 Apache management commands:"
echo "  Test config: sudo apache2ctl configtest"
echo "  Reload: sudo systemctl reload apache2"
echo "  Restart: sudo systemctl restart apache2"
echo "  Status: sudo systemctl status apache2"
echo "  Error logs: sudo tail -f /var/log/apache2/wificount_error.log"
echo "  Access logs: sudo tail -f /var/log/apache2/wificount_access.log"
