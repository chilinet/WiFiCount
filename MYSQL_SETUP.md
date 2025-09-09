# MySQL Setup Instructions

## Database Migration from MSSQL to MySQL

The application has been converted from MSSQL to MySQL. Here are the setup instructions:

### 1. Install MySQL

Make sure you have MySQL installed on your system. You can download it from [mysql.com](https://dev.mysql.com/downloads/mysql/) or use a package manager.

### 2. Create Database

Create a new MySQL database for your application:

```sql
CREATE DATABASE wifcount;
```

### 3. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/wifcount"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Email configuration (for password reset)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"
```

### 4. Install Dependencies

Install the new MySQL driver:

```bash
npm install
```

### 5. Generate Prisma Client

Generate the Prisma client for MySQL:

```bash
npx prisma generate
```

### 6. Run Database Migration

Create and apply the database migration:

```bash
npx prisma db push
```

Or if you want to create a migration file:

```bash
npx prisma migrate dev --name init
```

### 7. Seed Database (Optional)

If you have seed data, run:

```bash
npm run prisma:seed
```

### Connection String Examples

- **Local MySQL**: `mysql://root:password@localhost:3306/wifcount`
- **MySQL with SSL**: `mysql://username:password@hostname:3306/database_name?sslmode=require`
- **MySQL with specific charset**: `mysql://username:password@hostname:3306/database_name?charset=utf8mb4`

### Important Notes

- The application now uses `mysql2` driver instead of the MSSQL driver
- All existing Prisma models remain compatible with MySQL
- Make sure your MySQL server supports the required features (UTF-8, etc.)
- Update your production environment variables accordingly
