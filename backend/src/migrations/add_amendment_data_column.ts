import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function addAmendmentDataColumn() {
  const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('Database connection string not found in environment variables');
  }

  const pool = new Pool({
    connectionString,
  });

  try {
    console.log('🔄 Adding amendment_data column to investigation_logs table...');
    
    // Check if column already exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'investigation_logs' 
      AND column_name = 'amendment_data'
    `;
    
    const columnExists = await pool.query(checkColumnQuery);
    
    if (columnExists.rows.length > 0) {
      console.log('✅ amendment_data column already exists');
      return;
    }
    
    // Add the column
    const addColumnQuery = `
      ALTER TABLE investigation_logs 
      ADD COLUMN amendment_data JSONB
    `;
    
    await pool.query(addColumnQuery);
    console.log('✅ amendment_data column added successfully');
    
  } catch (error) {
    console.error('❌ Failed to add amendment_data column:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

addAmendmentDataColumn().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});

