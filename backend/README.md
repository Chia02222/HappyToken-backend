# Corporate Account System - Backend API

A NestJS backend API for the Corporate Account System, built with Kysely and Neon PostgreSQL.

## Features

- ✅ NestJS framework with TypeScript
- ✅ Kysely query builder with Neon PostgreSQL dialect
- ✅ Database migrations
- ✅ CRUD operations for corporate accounts
- ✅ Seed data functionality
- ✅ Health check endpoint

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Neon PostgreSQL database (or any PostgreSQL database)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/corporate_account_system
   NEON_DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   
   # Application Configuration
   PORT=3001
   NODE_ENV=development
   ```

3. **Run database migrations:**
   ```bash
   npm run migrate
   ```

4. **Start the development server:**
   ```bash
   npm run start:dev
   ```

5. **Seed the database (optional):**
   ```bash
   curl -X POST http://localhost:3001/seed
   ```

## API Endpoints

### Health Check
- `GET /health` - Check application and database health

### Corporate Accounts
- `GET /corporates` - Get all corporate accounts
- `GET /corporates/:id` - Get corporate account by ID
- `POST /corporates` - Create new corporate account
- `PUT /corporates/:id` - Update corporate account
- `DELETE /corporates/:id` - Delete corporate account

### Corporate Contacts
- `POST /corporates/:id/contacts` - Add contact to corporate account

### Corporate Subsidiaries
- `POST /corporates/:id/subsidiaries` - Add subsidiary to corporate account

### Investigation Logs
- `POST /corporates/:id/investigation-logs` - Add investigation log entry

### Status Management
- `PUT /corporates/:id/status` - Update corporate account status

### Database Seeding
- `POST /seed` - Seed database with mock data

## Database Schema

The application uses the following main tables:

- **corporates** - Main corporate account information
- **contacts** - Contact persons for each corporate
- **subsidiaries** - Subsidiary companies
- **investigation_logs** - Status change and investigation history

## Development

- **Build:** `npm run build`
- **Start:** `npm run start`
- **Start (dev):** `npm run start:dev`
- **Lint:** `npm run lint`
- **Test:** `npm run test`

## Migration Commands

- **Run Kysely migrations (creates Kysely metadata tables):** `npm run migrate`
- **Drop all tables (also drops Kysely metadata tables):** `npm run reset:tables`
- **Create business tables via SQL (no Kysely metadata):** `npm run migrate:sql`
- **Populate sample data into Neon:** `npm run migrate:data`

### Recommended flows

1) Use Kysely-managed migrations (includes metadata tables):
   - Ensure DB is empty (or previously migrated by Kysely)
   - Run: `npm run migrate`
   - Optional seed: `npm run migrate:data`

2) Use SQL-only schema (no Kysely metadata tables):
   - Reset/destroy all tables: `npm run reset:tables`
   - Create the four business tables: `npm run migrate:sql`
   - Populate demo data: `npm run migrate:data`

Note: Do not mix flows in one run. If you choose SQL-only, skip `npm run migrate` to avoid recreating Kysely metadata tables `kysely_migration` and `kysely_migration_lock`.

### Verify in Neon

Run these in your SQL console:

- List tables:
  - `select table_name from information_schema.tables where table_schema = 'public' order by table_name;`
- Counts:
  - `select count(*) from corporates;`
  - `select count(*) from contacts;`
  - `select count(*) from subsidiaries;`
  - `select count(*) from investigation_logs;`

## Architecture

- **Database Service:** Handles Kysely database connection
- **Corporate Service:** Business logic for corporate operations
- **Corporate Controller:** HTTP endpoints for corporate operations
- **Seed Service:** Database seeding functionality

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEON_DATABASE_URL` | Neon PostgreSQL connection string | Yes |
| `PORT` | Application port | No (default: 3001) |
| `NODE_ENV` | Environment | No (default: development) |