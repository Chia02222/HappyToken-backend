import { OnModuleInit } from '@nestjs/common';
import { NeonQueryFunction } from '@neondatabase/serverless';
import { Kysely } from 'kysely';
import type { Database } from './types';
export declare class DatabaseService implements OnModuleInit {
    private sql;
    private db;
    constructor();
    private initializeDatabase;
    onModuleInit(): Promise<void>;
    getSql(): NeonQueryFunction<boolean, boolean>;
    getDb(): Kysely<Database>;
}
