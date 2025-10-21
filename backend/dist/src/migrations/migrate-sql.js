import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config();
export async function migrateToLatest() {
    const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
    if (!connectionString) {
        throw new Error('Database connection string not found in environment variables');
    }
    const sql = neon(connectionString);
    console.log('🔄 Resetting and migrating schema (UUID primary keys)...');
    try {
        await sql `CREATE EXTENSION IF NOT EXISTS pgcrypto`;
        console.log('🔄 Dropping existing tables (if any)...');
        await sql `DROP TABLE IF EXISTS investigation_logs CASCADE`;
        await sql `DROP TABLE IF EXISTS contacts CASCADE`;
        await sql `DROP TABLE IF EXISTS contact CASCADE`;
        await sql `DROP TABLE IF EXISTS subsidiaries CASCADE`;
        await sql `DROP TABLE IF EXISTS corporates CASCADE`;
        console.log('🔄 Creating corporates table...');
        await sql `
      CREATE TABLE corporates (
        uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
        second_approval_confirmation BOOLEAN DEFAULT false,
        cooling_period_start TIMESTAMP,
        cooling_period_end TIMESTAMP,
        secondary_approver_uuid UUID,
        pinned BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
        await sql `CREATE UNIQUE INDEX corporates_reg_number_uq ON corporates(reg_number)`;
        console.log('🔄 Creating contacts table...');
        await sql `
      CREATE TABLE contacts (
        uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        corporate_uuid UUID NOT NULL REFERENCES corporates(uuid) ON DELETE CASCADE,
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
        await sql `CREATE UNIQUE INDEX contacts_uuid_uq ON contacts(uuid)`;
        await sql `CREATE INDEX contacts_corporate_uuid_idx ON contacts(corporate_uuid)`;
        await sql `ALTER TABLE corporates ADD CONSTRAINT corporates_secondary_approver_fk FOREIGN KEY (secondary_approver_uuid) REFERENCES contacts(uuid) ON DELETE SET NULL`;
        console.log('🔄 Creating subsidiaries table...');
        await sql `
      CREATE TABLE subsidiaries (
        uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        corporate_uuid UUID NOT NULL REFERENCES corporates(uuid) ON DELETE CASCADE,
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
        await sql `CREATE UNIQUE INDEX subsidiaries_uuid_uq ON subsidiaries(uuid)`;
        await sql `CREATE INDEX subsidiaries_corporate_uuid_idx ON subsidiaries(corporate_uuid)`;
        console.log('🔄 Creating investigation_logs table...');
        await sql `
      CREATE TABLE investigation_logs (
        uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        corporate_uuid UUID NOT NULL REFERENCES corporates(uuid) ON DELETE CASCADE,
        timestamp VARCHAR(255) NOT NULL,
        note TEXT,
        from_status VARCHAR(50),
        to_status VARCHAR(50),
        amendment_data JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
        await sql `CREATE INDEX investigation_logs_corporate_uuid_idx ON investigation_logs(corporate_uuid)`;
        await sql `CREATE INDEX investigation_logs_to_status_idx ON investigation_logs(to_status)`;
        await sql `CREATE INDEX investigation_logs_timestamp_idx ON investigation_logs(timestamp)`;
        await sql `CREATE INDEX investigation_logs_created_at_idx ON investigation_logs(created_at)`;
        await sql `CREATE INDEX corporates_status_idx ON corporates(status)`;
        await sql `CREATE INDEX corporates_updated_at_idx ON corporates(updated_at)`;
        await sql `CREATE INDEX corporates_pinned_idx ON corporates(pinned)`;
        await sql `CREATE INDEX corporates_created_at_idx ON corporates(created_at)`;
        await sql `CREATE INDEX corporates_status_updated_at_idx ON corporates(status, updated_at)`;
        await sql `CREATE INDEX investigation_logs_corporate_uuid_to_status_idx ON investigation_logs(corporate_uuid, to_status)`;
        await sql `CREATE INDEX contacts_email_idx ON contacts(email)`;
        await sql `CREATE INDEX contacts_system_role_idx ON contacts(system_role)`;
        await sql `CREATE INDEX subsidiaries_company_name_idx ON subsidiaries(company_name)`;
        await sql `CREATE INDEX subsidiaries_reg_number_idx ON subsidiaries(reg_number)`;
        console.log('✅ Schema reset and migration completed successfully');
    }
    catch (error) {
        console.error('❌ Failed to migrate:', error);
        process.exit(1);
    }
}
migrateToLatest().catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
//# sourceMappingURL=migrate-sql.js.map