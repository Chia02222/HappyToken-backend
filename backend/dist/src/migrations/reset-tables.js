import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
async function resetTables() {
    const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
    if (!connectionString) {
        throw new Error('Database connection string not found in environment variables');
    }
    const sql = neon(connectionString);
    console.log('🔄 Resetting database tables...');
    try {
        console.log('🧹 Dropping existing tables...');
        await sql `DROP TABLE IF EXISTS investigation_logs CASCADE`;
        await sql `DROP TABLE IF EXISTS subsidiaries CASCADE`;
        await sql `DROP TABLE IF EXISTS contacts CASCADE`;
        await sql `DROP TABLE IF EXISTS corporates CASCADE`;
        await sql `DROP TABLE IF EXISTS kysely_migration_lock CASCADE`;
        await sql `DROP TABLE IF EXISTS kysely_migration CASCADE`;
        console.log('✅ Tables dropped successfully');
        console.log('✅ All tables reset successfully');
    }
    catch (error) {
        console.error('❌ Failed to reset tables:', error);
        throw error;
    }
}
resetTables().catch((error) => {
    console.error('❌ Reset failed:', error);
    process.exit(1);
});
//# sourceMappingURL=reset-tables.js.map