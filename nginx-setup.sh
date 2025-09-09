#!/bin/bash

# Nginx Setup Script for WiFiCount
# Usage: ./nginx-setup.sh yourdomain.com

set -e

DOMAIN=${1}
if [ -z "$DOMAIN" ]; then
    echo "Usage: ./nginx-setup.sh yourdomain.com"
    exit 1
fi

echo "🔧 Setting up Nginx for WiFiCount on $DOMAIN..."

# Prüfe ob Nginx installiert ist
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    sudo apt update
    sudo apt install -y nginx
fi

# Erstelle Nginx-Konfiguration
sudo tee /etc/nginx/sites-available/wificount > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Aktiviere Site
sudo ln -sf /etc/nginx/sites-available/wificount /etc/nginx/sites-enabled/

# Entferne default site
sudo rm -f /etc/nginx/sites-enabled/default

# Teste Nginx-Konfiguration
sudo nginx -t

# Starte/Neustarte Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "✅ Nginx configuration created and activated"
echo "🌍 Site is available at: http://$DOMAIN"

# SSL Setup mit Let's Encrypt
read -p "Do you want to set up SSL with Let's Encrypt? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔒 Setting up SSL with Let's Encrypt..."
    
    # Installiere Certbot
    sudo apt install -y certbot python3-certbot-nginx
    
    # Erstelle SSL-Zertifikat
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    # Teste Auto-Renewal
    sudo certbot renew --dry-run
    
    echo "✅ SSL certificate installed"
    echo "🔒 Site is now available at: https://$DOMAIN"
fi

echo ""
echo "📋 Nginx management commands:"
echo "  Test config: sudo nginx -t"
echo "  Reload: sudo systemctl reload nginx"
echo "  Restart: sudo systemctl restart nginx"
echo "  Status: sudo systemctl status nginx"
echo "  Logs: sudo tail -f /var/log/nginx/access.log"
