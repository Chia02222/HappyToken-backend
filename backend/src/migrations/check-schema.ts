import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!connectionString) {
    throw new Error('Database connection string not found in env');
  }
  const sql = neon(connectionString);

  const tables = ['corporates', 'contacts', 'subsidiaries', 'investigation_logs'];
  for (const table of tables) {
    const rows = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${table}
      ORDER BY ordinal_position
    ` as unknown as Array<{ column_name: string; data_type: string }>;
    console.log(`\n=== ${table} columns ===`);
    for (const r of rows) {
      console.log(`${r.column_name} :: ${r.data_type}`);
    }
  }
}

main().catch((err) => {
  console.error('check-schema failed:', err);
  process.exit(1);
});


