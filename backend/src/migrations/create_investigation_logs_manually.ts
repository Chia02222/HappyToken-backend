import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function createInvestigationLogsTable() {
  const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('Database connection string not found in environment variables');
  }

  const pool = new Pool({
    connectionString,
  });

  try {
    console.log('🔄 Creating investigation_logs table...');
    
    // Check if table already exists
    const checkTableQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'investigation_logs'
    `;
    
    const tableExists = await pool.query(checkTableQuery);
    
    if (tableExists.rows.length > 0) {
      console.log('✅ investigation_logs table already exists');
    } else {
      // Create the table
      const createTableQuery = `
        CREATE TABLE investigation_logs (
          id SERIAL PRIMARY KEY,
          corporate_id INTEGER NOT NULL REFERENCES corporates(id) ON DELETE CASCADE,
          timestamp TIMESTAMP NOT NULL,
          note TEXT,
          from_status VARCHAR(50),
          to_status VARCHAR(50),
          amendment_data JSONB,
          created_at TIMESTAMP(0) NOT NULL DEFAULT NOW()
        )
      `;
      
      await pool.query(createTableQuery);
      console.log('✅ investigation_logs table created successfully');
    }
    
    // Now add the amendment_data column if it doesn't exist
    console.log('🔄 Adding amendment_data column...');
    
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'investigation_logs' 
      AND column_name = 'amendment_data'
    `;
    
    const columnExists = await pool.query(checkColumnQuery);
    
    if (columnExists.rows.length > 0) {
      console.log('✅ amendment_data column already exists');
    } else {
      const addColumnQuery = `
        ALTER TABLE investigation_logs 
        ADD COLUMN amendment_data JSONB
      `;
      
      await pool.query(addColumnQuery);
      console.log('✅ amendment_data column added successfully');
    }
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Failed to create investigation_logs table:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

createInvestigationLogsTable().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});

