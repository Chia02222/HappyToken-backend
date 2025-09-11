import { neon } from '@neondatabase/serverless';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function migrateToLatest() {
  const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('Database connection string not found in environment variables');
  }

  const sql = neon(connectionString);

  console.log('🔄 Running migrations...');
  
  try {
    // Read and execute each migration file
    const migrationFiles = [
      '001_create_corporates_table.ts',
      '002_create_contacts_table.ts', 
      '003_create_subsidiaries_table.ts',
      '004_create_investigation_logs_table.ts'
    ];

    for (const fileName of migrationFiles) {
      const filePath = path.join(__dirname, fileName);
      const migrationContent = await fs.readFile(filePath, 'utf-8');
      
      // Extract SQL from the migration file
      const sqlMatch = migrationContent.match(/sql`([\s\S]*?)`/);
      if (sqlMatch) {
        const sqlQuery = sqlMatch[1].trim();
        console.log(`🔄 Executing migration: ${fileName}`);
        await sql(sqlQuery);
        console.log(`✅ Migration "${fileName}" was executed successfully`);
      }
    }

    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Failed to migrate:', error);
    process.exit(1);
  }
}

migrateToLatest().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
