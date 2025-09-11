"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const serverless_1 = require("@neondatabase/serverless");
const fs_1 = require("fs");
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
async function migrateToLatest() {
    const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
    if (!connectionString) {
        throw new Error('Database connection string not found in environment variables');
    }
    const sql = (0, serverless_1.neon)(connectionString);
    console.log('🔄 Running migrations...');
    try {
        const migrationFiles = [
            '001_create_corporates_table.ts',
            '002_create_contacts_table.ts',
            '003_create_subsidiaries_table.ts',
            '004_create_investigation_logs_table.ts'
        ];
        for (const fileName of migrationFiles) {
            const filePath = path.join(__dirname, fileName);
            const migrationContent = await fs_1.promises.readFile(filePath, 'utf-8');
            const sqlMatch = migrationContent.match(/sql`([\s\S]*?)`/);
            if (sqlMatch) {
                const sqlQuery = sqlMatch[1].trim();
                console.log(`🔄 Executing migration: ${fileName}`);
                await sql(sqlQuery);
                console.log(`✅ Migration "${fileName}" was executed successfully`);
            }
        }
        console.log('✅ All migrations completed successfully');
    }
    catch (error) {
        console.error('❌ Failed to migrate:', error);
        process.exit(1);
    }
}
migrateToLatest().catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
});
//# sourceMappingURL=migrate.js.map