# Docker Compose Legacy Support

## Problem
Ihre Docker Compose Version (1.18.0) unterstützt das `version: '3.8'` Format nicht.

## Lösung

### Option 1: Automatisches Setup (Empfohlen)
```bash
# Das Setup-Skript erkennt automatisch Ihre Version
./docker-setup.sh
```

### Option 2: Legacy-Setup manuell
```bash
# Verwenden Sie das Legacy-Setup-Skript
./docker-setup-legacy.sh
```

### Option 3: Manuelle Befehle
```bash
# Mit Legacy-Datei
docker-compose -f docker-compose-legacy.yml build
docker-compose -f docker-compose-legacy.yml up -d app

# Logs anzeigen
docker-compose -f docker-compose-legacy.yml logs -f app

# Stoppen
docker-compose -f docker-compose-legacy.yml down
```

## Docker Compose Versionen

| Version | Format | Datei |
|---------|--------|-------|
| 1.x | Legacy | `docker-compose-legacy.yml` |
| 2.x+ | Modern | `docker-compose.yml` |

## Docker Compose aktualisieren (Optional)

### CentOS/RHEL:
```bash
# Alte Version entfernen
sudo yum remove docker-compose

# Neue Version installieren
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# Version prüfen
docker-compose --version
```

### Ubuntu/Debian:
```bash
# Alte Version entfernen
sudo apt remove docker-compose

# Neue Version installieren
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# Version prüfen
docker-compose --version
```

## Unterschiede zwischen den Formaten

### Legacy Format (1.x):
```yaml
# docker-compose-legacy.yml
app:
  build: .
  ports:
    - "3000:3000"
  environment:
    - DATABASE_URL=mysql://...
```

### Modern Format (2.x+):
```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://...
```

## Troubleshooting

### Fehler: "Version in docker-compose.yml is unsupported"
**Lösung:** Verwenden Sie `docker-compose-legacy.yml`

### Fehler: "Can't reach database server"
**Lösung:** Prüfen Sie die `DATABASE_URL` in der Umgebungsvariable

### Fehler: "Container won't start"
**Lösung:** Prüfen Sie die Logs:
```bash
docker-compose -f docker-compose-legacy.yml logs app
```
