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
const pg_1 = require("pg");
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
async function addAmendmentDataColumn() {
    const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
    if (!connectionString) {
        throw new Error('Database connection string not found in environment variables');
    }
    const pool = new pg_1.Pool({
        connectionString,
    });
    try {
        console.log('🔄 Adding amendment_data column to investigation_logs table...');
        const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'investigation_logs' 
      AND column_name = 'amendment_data'
    `;
        const columnExists = await pool.query(checkColumnQuery);
        if (columnExists.rows.length > 0) {
            console.log('✅ amendment_data column already exists');
            return;
        }
        const addColumnQuery = `
      ALTER TABLE investigation_logs 
      ADD COLUMN amendment_data JSONB
    `;
        await pool.query(addColumnQuery);
        console.log('✅ amendment_data column added successfully');
    }
    catch (error) {
        console.error('❌ Failed to add amendment_data column:', error);
        throw error;
    }
    finally {
        await pool.end();
    }
}
addAmendmentDataColumn().catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
});
//# sourceMappingURL=add_amendment_data_column.js.map