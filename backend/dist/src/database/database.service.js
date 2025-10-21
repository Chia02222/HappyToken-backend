import { neon } from '@neondatabase/serverless';
import { Kysely, sql } from 'kysely';
import { NeonDialect } from 'kysely-neon';
import * as dotenv from 'dotenv';
dotenv.config();
export class DatabaseService {
    sql;
    db;
    constructor() {
        this.initializeDatabase();
    }
    initializeDatabase() {
        const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
        if (!connectionString) {
            throw new Error('Database connection string not found in environment variables');
        }
        this.sql = neon(connectionString);
        this.db = new Kysely({
            dialect: new NeonDialect({ neon: this.sql })
        });
    }
    async initialize() {
        try {
            await this.sql `SELECT 1 as test`;
            await sql `select 1 as test`.execute(this.db);
            console.log('✅ Database connection established successfully');
        }
        catch (error) {
            console.error('❌ Failed to connect to database:', error);
            throw error;
        }
    }
    getSql() {
        return this.sql;
    }
    getDb() {
        return this.db;
    }
}
export const databaseService = new DatabaseService();
//# sourceMappingURL=database.service.js.map