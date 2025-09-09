# WiFiCount Server Deployment Guide

## Option 1: Docker Compose (Empfohlen für einfache Deployments)

### 1. Server vorbereiten
```bash
# Docker und Docker Compose installieren (Ubuntu/Debian)
sudo apt update
sudo apt install docker.io docker-compose-plugin

# Docker starten und aktivieren
sudo systemctl start docker
sudo systemctl enable docker

# Benutzer zur Docker-Gruppe hinzufügen
sudo usermod -aG docker $USER
# Neu anmelden oder: newgrp docker
```

### 2. Projekt auf Server kopieren
```bash
# Via Git
git clone <your-repo-url>
cd WiFiCount

# Oder via SCP
scp -r ./WiFiCount user@server:/home/user/
```

### 3. Umgebungsvariablen konfigurieren
```bash
# .env Datei erstellen
nano .env
```

Inhalt der `.env`:
```bash
DATABASE_URL=mysql://username:password@your-mysql-host:3306/wificnt
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-very-secure-secret-key-here
NEXT_PUBLIC_API_URL=https://cnradiusapi.chilinet.cloud
NEXT_PUBLIC_API_KEY=your-api-key
```

### 4. Container starten
```bash
# Build und Start
docker-compose up --build -d

# Logs prüfen
docker-compose logs -f app
```

## Option 2: Docker Image Build + Run (Für CI/CD)

### 1. Image auf Server bauen
```bash
# Image bauen
docker build -t wificount:latest .

# Image starten
docker run -d \
  --name wificount-app \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  wificount:latest
```

### 2. Mit Docker Registry (Produktionsumgebung)
```bash
# Image taggen
docker tag wificount:latest your-registry.com/wificount:latest

# Image pushen
docker push your-registry.com/wificount:latest

# Auf Server pullen und starten
docker pull your-registry.com/wificount:latest
docker run -d --name wificount-app -p 3000:3000 --env-file .env your-registry.com/wificount:latest
```

## Option 3: Mit Reverse Proxy (Apache)

### Für Ubuntu/Debian:
```bash
# Apache installieren
sudo apt install apache2

# Erforderliche Module aktivieren
sudo a2enmod proxy proxy_http headers rewrite ssl deflate

# Automatisches Setup
./apache-setup.sh yourdomain.com
```

### Für CentOS/RHEL:
```bash
# Apache (httpd) installieren
sudo yum install httpd

# Module aktivieren (automatisch mit centos-setup.sh)
./centos-setup.sh yourdomain.com
```

### 2. Manuelle Apache-Konfiguration

**Ubuntu/Debian:**
```bash
# Konfigurationsdatei kopieren
sudo cp wificount-apache.conf /etc/apache2/sites-available/wificount.conf

# Domain anpassen
sudo sed -i 's/yourdomain.com/ihre-domain.com/g' /etc/apache2/sites-available/wificount.conf

# Site aktivieren
sudo a2ensite wificount.conf
sudo a2dissite 000-default.conf

# Konfiguration testen
sudo apache2ctl configtest

# Apache neustarten
sudo systemctl restart apache2
```

**CentOS/RHEL:**
```bash
# Konfigurationsdatei kopieren
sudo cp wificount-centos.conf /etc/httpd/conf.d/wificount.conf

# Domain anpassen
sudo sed -i 's/yourdomain.com/ihre-domain.com/g' /etc/httpd/conf.d/wificount.conf

# Konfiguration testen
sudo httpd -t

# Apache neustarten
sudo systemctl restart httpd
```

### 3. SSL mit Let's Encrypt

**Ubuntu/Debian:**
```bash
# Certbot für Apache installieren
sudo apt install certbot python3-certbot-apache

# SSL-Zertifikat erstellen
sudo certbot --apache -d yourdomain.com

# Auto-Renewal testen
sudo certbot renew --dry-run
```

**CentOS/RHEL:**
```bash
# EPEL Repository und Certbot installieren
sudo yum install epel-release
sudo yum install certbot python3-certbot-apache

# SSL-Zertifikat erstellen
sudo certbot --apache -d yourdomain.com

# Auto-Renewal testen
sudo certbot renew --dry-run
```

## Option 4: Mit Docker Swarm (Für Skalierung)

### 1. Swarm initialisieren
```bash
# Swarm erstellen
docker swarm init

# Stack-Datei erstellen
nano docker-stack.yml
```

docker-stack.yml:
```yaml
version: '3.8'
services:
  app:
    image: wificount:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      - NEXT_PUBLIC_API_KEY=${NEXT_PUBLIC_API_KEY}
    deploy:
      replicas: 2
      restart_policy:
        condition: on-failure
```

### 2. Stack deployen
```bash
# Stack starten
docker stack deploy -c docker-stack.yml wificount

# Status prüfen
docker stack services wificount
```

## Option 5: Mit Kubernetes (Für Enterprise)

### 1. Kubernetes Manifest erstellen
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wificount-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: wificount
  template:
    metadata:
      labels:
        app: wificount
    spec:
      containers:
      - name: wificount
        image: wificount:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: wificount-secrets
              key: database-url
---
apiVersion: v1
kind: Service
metadata:
  name: wificount-service
spec:
  selector:
    app: wificount
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Automatisierung mit GitHub Actions

### 1. CI/CD Pipeline erstellen
```yaml
# .github/workflows/deploy.yml
name: Deploy to Server

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /path/to/WiFiCount
          git pull origin main
          docker-compose down
          docker-compose up --build -d
```

## Monitoring und Wartung

### 1. Container-Status überwachen
```bash
# Container-Status
docker ps

# Ressourcenverbrauch
docker stats

# Logs
docker logs -f wificount-app
```

### 2. Automatische Updates
```bash
# Watchtower für automatische Updates
docker run -d \
  --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  wificount-app
```

### 3. Backup-Strategie
```bash
# Datenbank-Backup
mysqldump -h mysql-host -u user -p wificnt > backup_$(date +%Y%m%d).sql

# Container-Backup
docker save wificount:latest | gzip > wificount_backup_$(date +%Y%m%d).tar.gz
```

## Empfohlene Deployment-Strategie

**Für kleine bis mittlere Projekte:**
- Docker Compose + Nginx + Let's Encrypt

**Für größere Projekte:**
- Docker Swarm oder Kubernetes
- CI/CD Pipeline
- Monitoring (Prometheus/Grafana)

**Für Enterprise:**
- Kubernetes mit Helm Charts
- GitOps mit ArgoCD
- Service Mesh (Istio)
