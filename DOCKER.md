# WiFiCount Docker Setup

This document explains how to run WiFiCount using Docker with MySQL.

## Prerequisites

- Docker installed
- Docker Compose installed
- `.env` file with database connection details (optional - defaults provided)

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd WiFiCount
   ```

2. **Run with MySQL (Recommended):**
   ```bash
   ./setup-mysql.sh
   ```

3. **Or run with external MySQL:**
   ```bash
   ./docker-setup.sh
   ```

4. **Access the application:**
   - Application: http://localhost:3000
   - MySQL Database: localhost:3307

## Docker Compose Files

The project includes multiple Docker Compose files for different scenarios:

- `docker-compose.yml` - Modern format with MySQL (Docker Compose 2.x+)
- `docker-compose-legacy.yml` - Legacy format with MySQL (Docker Compose 1.x)
- `docker-compose-simple.yml` - Simple format with MySQL (Docker Compose 1.x)

## Setup Scripts

### 1. MySQL Setup (Recommended)
```bash
./setup-mysql.sh
```
- Includes MySQL database
- Automatically detects Docker Compose version
- Imports `backup_wepper.sql` if available
- No external database required

### 2. External Database Setup
```bash
./docker-setup.sh
```
- Uses external MySQL database
- Requires `.env` file with database connection
- Automatically detects Docker Compose version

### 3. Simple Setup
```bash
./setup-simple.sh
```
- Uses simple Docker Compose format
- Maximum compatibility with older versions

## Manual Commands

If you prefer to run commands manually:

```bash
# Build and start with MySQL
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f app
docker-compose logs -f db

# Stop the application
docker-compose down
```

## Database Configuration

### MySQL Container Settings

- **Image:** mysql:8.0
- **Port:** 3307 (external), 3306 (internal)
- **Database:** wificnt
- **User:** wificount
- **Password:** wificount123
- **Root Password:** root

### Data Persistence

- MySQL data is stored in a Docker volume: `mysql_data`
- Data persists between container restarts
- To reset database: `docker-compose down -v`

### Import Existing Data

1. **Place your SQL dump in the project root as `backup_wepper.sql`**
2. **Restart the containers:**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## Environment Variables

### With MySQL Container (Default)
No `.env` file required - all settings are configured in Docker Compose.

### With External Database
Create `.env` file with:
```env
DATABASE_URL=mysql://username:password@host:port/database
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_API_URL=https://cnradiusapi.chilinet.cloud
NEXT_PUBLIC_API_KEY=your-api-key
```

## Troubleshooting

### Docker Compose Version Issues

If you encounter version compatibility issues:

1. **Check your Docker Compose version:**
   ```bash
   docker-compose --version
   ```

2. **Use the appropriate setup script:**
   - All scripts automatically detect and use the correct format

3. **Manual file selection:**
   ```bash
   # For Docker Compose 1.x
   docker-compose -f docker-compose-simple.yml up -d
   
   # For Docker Compose 2.x+
   docker-compose -f docker-compose.yml up -d
   ```

### Database Connection Issues

1. **Check if MySQL container is running:**
   ```bash
   docker ps
   ```

2. **Check database logs:**
   ```bash
   docker-compose logs db
   ```

3. **Connect to MySQL directly:**
   ```bash
   docker exec -it wificount-mysql mysql -u wificount -p wificnt
   # Password: wificount123
   
   # Or connect from outside the container:
   mysql -h localhost -P 3307 -u wificount -p wificnt
   ```

### Application Issues

1. **Check application logs:**
   ```bash
   docker-compose logs app
   ```

2. **Restart application:**
   ```bash
   docker-compose restart app
   ```

3. **Rebuild application:**
   ```bash
   docker-compose up --build -d app
   ```

## Production Deployment

For production deployment:

1. **Change default passwords in docker-compose.yml**
2. **Use environment variables for sensitive data**
3. **Set up proper secrets management**
4. **Configure reverse proxy (Nginx/Apache)**
5. **Set up SSL certificates**
6. **Configure backup strategies for MySQL data**

## Useful Commands

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f app
docker-compose logs -f db

# Restart services
docker-compose restart

# Rebuild and restart
docker-compose up --build -d

# Stop all services
docker-compose down

# Remove volumes (WARNING: This will delete all data)
docker-compose down -v

# Access MySQL shell
docker exec -it wificount-mysql mysql -u wificount -p wificnt

# Connect from outside container
mysql -h localhost -P 3307 -u wificount -p wificnt

# Backup database
docker exec wificount-mysql mysqldump -u wificount -p wificnt > backup.sql
```