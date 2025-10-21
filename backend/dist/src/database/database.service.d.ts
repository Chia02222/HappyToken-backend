import { NeonQueryFunction } from '@neondatabase/serverless';
import { Kysely } from 'kysely';
import type { Database } from './types';
export declare class DatabaseService {
    private sql;
    private db;
    constructor();
    private initializeDatabase;
    initialize(): Promise<void>;
    getSql(): NeonQueryFunction<boolean, boolean>;
    getDb(): Kysely<Database>;
}
export declare const databaseService: DatabaseService;
