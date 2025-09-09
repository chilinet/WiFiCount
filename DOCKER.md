# WiFiCount Docker Setup

Diese Anleitung zeigt, wie Sie WiFiCount mit Docker auf einem Server mit vorhandener MySQL-Datenbank bereitstellen.

## Voraussetzungen

- Docker und Docker Compose installiert
- MySQL-Server bereits auf dem Server verfügbar
- Zugriff auf die MySQL-Datenbank

## Schnellstart

1. **Umgebungsvariablen konfigurieren**
   
   Erstellen Sie eine `.env` Datei mit Ihren Datenbankverbindungsdetails:
   ```bash
   DATABASE_URL=mysql://username:password@host:port/database
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   NEXT_PUBLIC_API_URL=https://cnradiusapi.chilinet.cloud
   NEXT_PUBLIC_API_KEY=your-api-key
   ```

2. **Docker-Container starten**
   ```bash
   # Automatisches Setup
   ./docker-setup.sh
   
   # Oder manuell
   docker-compose up --build -d
   ```

3. **Anwendung aufrufen**
   - Öffnen Sie http://localhost:3000 in Ihrem Browser

## Manuelle Befehle

```bash
# Container bauen
docker-compose build

# Container starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f app

# Container stoppen
docker-compose down

# Container neu starten
docker-compose restart

# Container mit neuen Änderungen neu bauen
docker-compose up --build -d
```

## Datenbankverbindung

Die Anwendung verbindet sich mit Ihrer vorhandenen MySQL-Datenbank über die `DATABASE_URL` Umgebungsvariable.

Beispiel für verschiedene MySQL-Konfigurationen:

```bash
# Lokale MySQL-Instanz
DATABASE_URL=mysql://root:password@localhost:3306/wificnt

# Remote MySQL-Server
DATABASE_URL=mysql://user:password@mysql.example.com:3306/wificnt

# MySQL mit SSL
DATABASE_URL=mysql://user:password@mysql.example.com:3306/wificnt?sslmode=require
```

## Produktions-Deployment

Für Produktionsumgebungen:

1. **Sichere Umgebungsvariablen setzen**
   ```bash
   NEXTAUTH_SECRET=your-very-secure-secret-key
   NEXTAUTH_URL=https://yourdomain.com
   ```

2. **Reverse Proxy konfigurieren** (nginx/Apache)
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **SSL-Zertifikat hinzufügen** (Let's Encrypt empfohlen)

## Troubleshooting

### Container startet nicht
```bash
# Logs prüfen
docker-compose logs app

# Container-Status prüfen
docker-compose ps
```

### Datenbankverbindungsfehler
- Prüfen Sie die `DATABASE_URL` in der `.env` Datei
- Stellen Sie sicher, dass der MySQL-Server erreichbar ist
- Prüfen Sie Firewall-Einstellungen

### Port bereits belegt
```bash
# Anderen Port verwenden
docker-compose up -d -p 3001:3000
```

## Wartung

### Logs rotieren
```bash
# Logs löschen
docker-compose logs --tail=0 -f app > /dev/null
```

### Container aktualisieren
```bash
# Neues Image bauen und starten
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Datenbank-Backup
```bash
# Backup erstellen (außerhalb des Containers)
mysqldump -h host -u user -p database > backup.sql
```
