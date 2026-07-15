# Taj Tyre Works - Installation & Environment Setup Guide

Follow these steps to deploy and run the **Taj Tyre Works** application in local development or production environments.

---

## 1. Prerequisites

Ensure you have the following installed on your target system:
- **Node.js**: Version 18.0.0 or higher.
- **npm**: Version 9.0.0 or higher.
- **PostgreSQL Database**: Access to a local or cloud-hosted database (e.g., Neon.tech).

---

## 2. Setup Environment Variables

Create a file named `.env` in the root directory of the project and populate it with the following configuration details:

```env
# PostgreSQL connection string (supports connection pooling)
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"

# Node environment setting
NODE_ENV="development" # Set to "production" in commercial deployments
```

---

## 3. Dependency Installation

Execute the following command in your terminal to install the necessary node modules:

```bash
npm install
```

---

## 4. Database Setup & Sync

Use Prisma to synchronize your database tables and seed initial administrator accounts:

1. **Apply Migrations**: Creates all tables, constraints, foreign keys, and indexes in your database:
   ```bash
   npx prisma migrate dev --name init
   ```
2. **Generate Prisma Client**: Automatically updates local TypeScript type definitions:
   ```bash
   npx prisma generate
   ```
3. **Execute Seeding**: Seeds core user accounts (e.g., Samar, Noxis, receptionist, mechanic), initial tyre stocks, and suppliers:
   ```bash
   node prisma/seed.js
   ```

---

## 5. Running the Application

### Development Mode
To launch the hot-reloading development server on `http://localhost:3000`:
```bash
npm run dev
```

### Production Mode
To run a fully optimized commercial build:
```bash
# Compile and optimize page bundles
npm run build

# Start the node server
npm run start
```
