import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function debugAmendmentQuery() {
  const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('Database connection string not found in environment variables');
  }

  const pool = new Pool({
    connectionString,
  });

  try {
    console.log('🔍 Debugging amendment query...');
    
    // Test the exact query from the service
    const query = `
      SELECT * 
      FROM investigation_logs 
      WHERE to_status = 'Amendment Requested'
      ORDER BY created_at DESC
    `;
    
    console.log('📝 Executing query:', query);
    
    const result = await pool.query(query);
    console.log(`✅ Query executed successfully. Found ${result.rows.length} rows.`);
    
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ID: ${row.id}, Corporate: ${row.corporate_id}, To Status: ${row.to_status}`);
    });
    
    // Test with corporate_id filter
    const queryWithFilter = `
      SELECT * 
      FROM investigation_logs 
      WHERE to_status = 'Amendment Requested'
      AND corporate_id = 16
      ORDER BY created_at DESC
    `;
    
    console.log('\n📝 Executing query with filter:', queryWithFilter);
    
    const resultWithFilter = await pool.query(queryWithFilter);
    console.log(`✅ Query with filter executed successfully. Found ${resultWithFilter.rows.length} rows.`);
    
    resultWithFilter.rows.forEach((row, index) => {
      console.log(`${index + 1}. ID: ${row.id}, Corporate: ${row.corporate_id}, To Status: ${row.to_status}`);
    });
    
  } catch (error) {
    console.error('❌ Query failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

debugAmendmentQuery().catch((error) => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
});


