# Database Setup and Migration Guide

This guide will help you set up the Neon PostgreSQL database and migrate all the data from the frontend constants.

## Prerequisites

1. **Neon Database Account**: Sign up at [neon.tech](https://neon.tech)
2. **Database Connection String**: Get your connection string from Neon dashboard

## Step 1: Configure Environment Variables

1. Update the `.env` file in the backend directory with your Neon database URL:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
NEON_DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# Application Configuration
PORT=3001
NODE_ENV=development
```

**Replace the DATABASE_URL with your actual Neon connection string.**

## Step 2: Run Database Migrations

1. **Create Database Tables**:
   ```bash
   npm run migrate
   ```
   This will create all the necessary tables:
   - `corporates` - Main corporate account information
   - `contacts` - Contact persons for each corporate
   - `subsidiaries` - Subsidiary companies
   - `investigation_logs` - Status change and investigation history

2. **Migrate Data from Constants**:
   ```bash
   npm run migrate:data
   ```
   This will migrate all the data from the frontend constants.ts file including:
   - 10 corporate accounts with full details
   - Contact information for each corporate
   - Subsidiary companies
   - Investigation logs and status history

## Step 3: Verify Migration

1. **Start the Backend Server**:
   ```bash
   npm run start:dev
   ```

2. **Test the API Endpoints**:
   - Health Check: `GET http://localhost:3001/health`
   - Get All Corporates: `GET http://localhost:3001/corporates`
   - Get Corporate by ID: `GET http://localhost:3001/corporates/1`

3. **Seed Additional Data** (Optional):
   ```bash
   curl -X POST http://localhost:3001/seed
   ```

## Step 4: Connect Frontend to Backend

1. **Update Frontend API Calls**: Modify the frontend to use the backend API instead of constants
2. **Environment Variables**: Set up API base URL in frontend
3. **CORS Configuration**: Ensure backend allows frontend requests

## Data Migration Details

The migration script will transfer:

### Corporate Accounts (10 records)
- Global Tech Inc. (Approved)
- Synergy Innovations (Cooling Period) - with subsidiary and 2 contacts
- Quantum Solutions (Pending 1st Approval)
- Apex Industries (Pending 2nd Approval)
- Dynamic Corp (Sent)
- Innovate LLC (New)
- Legacy Holdings (Rejected) - with investigation logs
- Future Enterprises (Resolved)
- Pinnacle Group (Closed) - with investigation logs
- Summit Partners (Reopened)

### Related Data
- **Contacts**: 10+ contact persons across all corporates
- **Subsidiaries**: 1 subsidiary (Synergy Digital Ventures)
- **Investigation Logs**: Status change history for rejected/closed accounts

## API Endpoints Available

After migration, you can use these endpoints:

### Corporate Management
- `GET /corporates` - List all corporates
- `GET /corporates/:id` - Get corporate with full details
- `POST /corporates` - Create new corporate
- `PUT /corporates/:id` - Update corporate
- `DELETE /corporates/:id` - Delete corporate

### Related Data
- `POST /corporates/:id/contacts` - Add contact
- `POST /corporates/:id/subsidiaries` - Add subsidiary
- `POST /corporates/:id/investigation-logs` - Add investigation log
- `PUT /corporates/:id/status` - Update status

### Utility
- `GET /health` - Health check
- `POST /seed` - Seed additional data

## Troubleshooting

### Common Issues

1. **Connection Failed**: Check your DATABASE_URL in .env
2. **Migration Failed**: Ensure tables don't exist or clear them first
3. **Port Conflicts**: Backend runs on port 3001, frontend on 3002

### Reset Database

To start fresh:
```bash
# Clear all data and re-migrate
npm run migrate:data
```

## Next Steps

1. **Frontend Integration**: Update frontend to use API endpoints
2. **Authentication**: Add user authentication if needed
3. **Validation**: Add proper form validation
4. **Error Handling**: Implement comprehensive error handling
5. **Testing**: Add unit and integration tests

## Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify your Neon database connection
3. Ensure all environment variables are set correctly
4. Check that the database tables were created successfully
