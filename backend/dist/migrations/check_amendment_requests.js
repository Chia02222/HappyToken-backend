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
async function checkAmendmentRequests() {
    const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
    if (!connectionString) {
        throw new Error('Database connection string not found in environment variables');
    }
    const pool = new pg_1.Pool({
        connectionString,
    });
    try {
        console.log('🔍 Checking amendment requests in database...');
        const allLogsQuery = `
      SELECT id, corporate_id, timestamp, note, from_status, to_status, amendment_data, created_at
      FROM investigation_logs 
      ORDER BY created_at DESC
      LIMIT 10
    `;
        const allLogs = await pool.query(allLogsQuery);
        console.log('📋 Recent investigation logs:');
        allLogs.rows.forEach((log, index) => {
            console.log(`${index + 1}. ID: ${log.id}, Corporate: ${log.corporate_id}, From: ${log.from_status}, To: ${log.to_status}`);
            console.log(`   Note: ${log.note}`);
            console.log(`   Amendment Data: ${log.amendment_data ? 'Yes' : 'No'}`);
            console.log('');
        });
        const amendmentQuery = `
      SELECT id, corporate_id, timestamp, note, from_status, to_status, amendment_data, created_at
      FROM investigation_logs 
      WHERE to_status = 'Amendment Requested'
      ORDER BY created_at DESC
    `;
        const amendmentLogs = await pool.query(amendmentQuery);
        console.log(`📝 Amendment requests found: ${amendmentLogs.rows.length}`);
        amendmentLogs.rows.forEach((log, index) => {
            console.log(`${index + 1}. ID: ${log.id}, Corporate: ${log.corporate_id}`);
            console.log(`   Note: ${log.note}`);
            console.log(`   Amendment Data: ${JSON.stringify(log.amendment_data, null, 2)}`);
            console.log('');
        });
    }
    catch (error) {
        console.error('❌ Failed to check amendment requests:', error);
        throw error;
    }
    finally {
        await pool.end();
    }
}
checkAmendmentRequests().catch((error) => {
    console.error('❌ Check failed:', error);
    process.exit(1);
});
//# sourceMappingURL=check_amendment_requests.js.map