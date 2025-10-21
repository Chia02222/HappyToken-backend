import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { Kysely, sql } from 'kysely';
import { NeonDialect } from 'kysely-neon';
import type { Database } from './types';
import * as dotenv from 'dotenv';

dotenv.config();

export class DatabaseService {
  private sql: NeonQueryFunction<boolean, boolean>;
  private db!: Kysely<Database>;

  constructor() {
    this.initializeDatabase();
  }

  private initializeDatabase() {
    const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('Database connection string not found in environment variables');
    }

    // Use Neon serverless client
    this.sql = neon(connectionString);

    // Initialize Kysely with Neon dialect
    this.db = new Kysely<Database>({
      dialect: new NeonDialect({ neon: this.sql })
    });
  }

  async initialize() {
    try {
      // Test the database connection
      await this.sql`SELECT 1 as test`;
      await sql`select 1 as test`.execute(this.db);
      console.log('✅ Database connection established successfully');
    } catch (error) {
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

// Singleton instance
export const databaseService = new DatabaseService();
