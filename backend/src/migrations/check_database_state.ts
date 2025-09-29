import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function checkDatabaseState() {
  const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('Database connection string not found in environment variables');
  }

  const pool = new Pool({
    connectionString,
  });

  try {
    console.log('🔍 Checking database state...');
    
    // Check what tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    const tables = await pool.query(tablesQuery);
    console.log('📋 Existing tables:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Check if investigation_logs exists and its structure
    if (tables.rows.some(row => row.table_name === 'investigation_logs')) {
      console.log('\n🔍 investigation_logs table structure:');
      const structureQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'investigation_logs'
        ORDER BY ordinal_position
      `;
      
      const structure = await pool.query(structureQuery);
      structure.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    } else {
      console.log('\n❌ investigation_logs table does not exist');
    }
    
  } catch (error) {
    console.error('❌ Failed to check database state:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

checkDatabaseState().catch((error) => {
  console.error('❌ Check failed:', error);
  process.exit(1);
});

