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
async function debugAmendmentQuery() {
    const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
    if (!connectionString) {
        throw new Error('Database connection string not found in environment variables');
    }
    const pool = new pg_1.Pool({
        connectionString,
    });
    try {
        console.log('🔍 Debugging amendment query...');
        const query = `
      SELECT * 
      FROM investigation_logs 
      WHERE to_status = 'Amendment Requested'
      ORDER BY created_at DESC
    `;
        console.log('📝 Executing query:', query);
        const result = await pool.query(query);
        console.log(`✅ Query executed successfully. Found ${result.rows.length} rows.`);
        result.rows.forEach((row, index) => {
            console.log(`${index + 1}. ID: ${row.id}, Corporate: ${row.corporate_id}, To Status: ${row.to_status}`);
        });
        const queryWithFilter = `
      SELECT * 
      FROM investigation_logs 
      WHERE to_status = 'Amendment Requested'
      AND corporate_id = 16
      ORDER BY created_at DESC
    `;
        console.log('\n📝 Executing query with filter:', queryWithFilter);
        const resultWithFilter = await pool.query(queryWithFilter);
        console.log(`✅ Query with filter executed successfully. Found ${resultWithFilter.rows.length} rows.`);
        resultWithFilter.rows.forEach((row, index) => {
            console.log(`${index + 1}. ID: ${row.id}, Corporate: ${row.corporate_id}, To Status: ${row.to_status}`);
        });
    }
    catch (error) {
        console.error('❌ Query failed:', error);
        throw error;
    }
    finally {
        await pool.end();
    }
}
debugAmendmentQuery().catch((error) => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
});
//# sourceMappingURL=debug_amendment_query.js.map