import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function checkAmendmentRequests() {
  const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('Database connection string not found in environment variables');
  }

  const pool = new Pool({
    connectionString,
  });

  try {
    console.log('🔍 Checking amendment requests in database...');
    
    // Check all investigation logs
    const allLogsQuery = `
      SELECT id, corporate_id, timestamp, note, from_status, to_status, amendment_data, created_at
      FROM investigation_logs 
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    const allLogs = await pool.query(allLogsQuery);
    console.log('📋 Recent investigation logs:');
    allLogs.rows.forEach((log, index) => {
      console.log(`${index + 1}. ID: ${log.id}, Corporate: ${log.corporate_id}, From: ${log.from_status}, To: ${log.to_status}`);
      console.log(`   Note: ${log.note}`);
      console.log(`   Amendment Data: ${log.amendment_data ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    // Check specifically for amendment requests
    const amendmentQuery = `
      SELECT id, corporate_id, timestamp, note, from_status, to_status, amendment_data, created_at
      FROM investigation_logs 
      WHERE to_status = 'Amendment Requested'
      ORDER BY created_at DESC
    `;
    
    const amendmentLogs = await pool.query(amendmentQuery);
    console.log(`📝 Amendment requests found: ${amendmentLogs.rows.length}`);
    amendmentLogs.rows.forEach((log, index) => {
      console.log(`${index + 1}. ID: ${log.id}, Corporate: ${log.corporate_id}`);
      console.log(`   Note: ${log.note}`);
      console.log(`   Amendment Data: ${JSON.stringify(log.amendment_data, null, 2)}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Failed to check amendment requests:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

checkAmendmentRequests().catch((error) => {
  console.error('❌ Check failed:', error);
  process.exit(1);
});


