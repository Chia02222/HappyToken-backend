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
dotenv.config();
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
        console.log('✅ Tables dropped successfully');
        console.log('🔄 Creating corporates table...');
        await sql `
      CREATE TABLE corporates (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        reg_number VARCHAR(50) NOT NULL UNIQUE,
        status VARCHAR(50) NOT NULL,
        office_address1 VARCHAR(255) NOT NULL,
        office_address2 VARCHAR(255),
        postcode VARCHAR(20) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL DEFAULT 'Malaysia',
        website VARCHAR(255),
        account_note TEXT,
        billing_same_as_official BOOLEAN NOT NULL DEFAULT true,
        billing_address1 VARCHAR(255),
        billing_address2 VARCHAR(255),
        billing_postcode VARCHAR(20),
        billing_city VARCHAR(100),
        billing_state VARCHAR(100),
        billing_country VARCHAR(100) DEFAULT 'Malaysia',
        company_tin VARCHAR(50),
        sst_number VARCHAR(50),
        agreement_from DATE,
        agreement_to DATE,
        credit_limit VARCHAR(20) DEFAULT '0.00',
        credit_terms VARCHAR(10),
        transaction_fee VARCHAR(10),
        late_payment_interest VARCHAR(10),
        white_labeling_fee VARCHAR(10),
        custom_feature_fee VARCHAR(20) DEFAULT '0.00',
        agreed_to_generic_terms BOOLEAN NOT NULL DEFAULT false,
        agreed_to_commercial_terms BOOLEAN NOT NULL DEFAULT false,
        first_approval_confirmation BOOLEAN NOT NULL DEFAULT false,
        second_approval_confirmation BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
        console.log('✅ Corporates table created');
        console.log('🔄 Creating contacts table...');
        await sql `
      CREATE TABLE contacts (
        id SERIAL PRIMARY KEY,
        corporate_id INTEGER NOT NULL REFERENCES corporates(id) ON DELETE CASCADE,
        salutation VARCHAR(10) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        contact_number VARCHAR(20) NOT NULL,
        email VARCHAR(255) NOT NULL,
        company_role VARCHAR(100) NOT NULL,
        system_role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
        console.log('✅ Contacts table created');
        console.log('🔄 Creating subsidiaries table...');
        await sql `
      CREATE TABLE subsidiaries (
        id SERIAL PRIMARY KEY,
        corporate_id INTEGER NOT NULL REFERENCES corporates(id) ON DELETE CASCADE,
        company_name VARCHAR(255) NOT NULL,
        reg_number VARCHAR(50) NOT NULL,
        office_address1 VARCHAR(255) NOT NULL,
        office_address2 VARCHAR(255),
        postcode VARCHAR(20) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL DEFAULT 'Malaysia',
        website VARCHAR(255),
        account_note TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
        console.log('✅ Subsidiaries table created');
        console.log('🔄 Creating investigation_logs table...');
        await sql `
      CREATE TABLE investigation_logs (
        id SERIAL PRIMARY KEY,
        corporate_id INTEGER NOT NULL REFERENCES corporates(id) ON DELETE CASCADE,
        timestamp VARCHAR(255) NOT NULL,
        note TEXT,
        from_status VARCHAR(50),
        to_status VARCHAR(50),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
        console.log('✅ Investigation logs table created');
        console.log('✅ All tables reset and created successfully');
    }
    catch (error) {
        console.error('❌ Failed to reset tables:', error);
        process.exit(1);
    }
}
resetTables().catch((error) => {
    console.error('❌ Reset failed:', error);
    process.exit(1);
});
//# sourceMappingURL=reset-tables.js.map