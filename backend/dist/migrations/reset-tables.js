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
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
async function resetTables() {
    const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
    if (!connectionString) {
        throw new Error('Database connection string not found in environment variables');
    }
    const sql = (0, serverless_1.neon)(connectionString);
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