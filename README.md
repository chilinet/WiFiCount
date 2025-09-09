# WiFiCount

A Next.js application for managing WiFi networks and captive portals with a hierarchical tree structure.

## Database Migration: MSSQL → MySQL

This application has been migrated from MSSQL to MySQL. See [MYSQL_SETUP.md](./MYSQL_SETUP.md) for detailed setup instructions.

## Getting Started

### Prerequisites

- Node.js 20.0.0 or higher
- MySQL server
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables (see [MYSQL_SETUP.md](./MYSQL_SETUP.md))

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

5. Set up the database:
   ```bash
   npx prisma db push
   ```

6. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Testing MySQL Connection

To test your MySQL connection, run:
```bash
node test-mysql-connection.js
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# WiFiCount
# WiFiCount
