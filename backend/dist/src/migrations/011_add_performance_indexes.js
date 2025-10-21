import { sql } from 'kysely';
export async function up(db) {
    console.log('🔄 Adding performance indexes...');
    await sql `CREATE INDEX IF NOT EXISTS corporates_status_idx ON corporates(status)`.execute(db);
    await sql `CREATE INDEX IF NOT EXISTS corporates_updated_at_idx ON corporates(updated_at)`.execute(db);
    await sql `CREATE INDEX IF NOT EXISTS corporates_pinned_idx ON corporates(pinned)`.execute(db);
    await sql `CREATE INDEX IF NOT EXISTS corporates_created_at_idx ON corporates(created_at)`.execute(db);
    await sql `CREATE INDEX IF NOT EXISTS corporates_status_updated_at_idx ON corporates(status, updated_at)`.execute(db);
    await sql `CREATE INDEX IF NOT EXISTS investigation_logs_to_status_idx ON investigation_logs(to_status)`.execute(db);
    await sql `CREATE INDEX IF NOT EXISTS investigation_logs_timestamp_idx ON investigation_logs(timestamp)`.execute(db);
    await sql `CREATE INDEX IF NOT EXISTS investigation_logs_created_at_idx ON investigation_logs(created_at)`.execute(db);
    await sql `CREATE INDEX IF NOT EXISTS investigation_logs_corporate_uuid_to_status_idx ON investigation_logs(corporate_uuid, to_status)`.execute(db);
    await sql `CREATE INDEX IF NOT EXISTS contacts_email_idx ON contacts(email)`.execute(db);
    await sql `CREATE INDEX IF NOT EXISTS contacts_system_role_idx ON contacts(system_role)`.execute(db);
    await sql `CREATE INDEX IF NOT EXISTS subsidiaries_company_name_idx ON subsidiaries(company_name)`.execute(db);
    await sql `CREATE INDEX IF NOT EXISTS subsidiaries_reg_number_idx ON subsidiaries(reg_number)`.execute(db);
    console.log('✅ Performance indexes added successfully');
}
export async function down(db) {
    console.log('🔄 Removing performance indexes...');
    await sql `DROP INDEX IF EXISTS corporates_status_idx`.execute(db);
    await sql `DROP INDEX IF EXISTS corporates_updated_at_idx`.execute(db);
    await sql `DROP INDEX IF EXISTS corporates_pinned_idx`.execute(db);
    await sql `DROP INDEX IF EXISTS corporates_created_at_idx`.execute(db);
    await sql `DROP INDEX IF EXISTS corporates_status_updated_at_idx`.execute(db);
    await sql `DROP INDEX IF EXISTS investigation_logs_to_status_idx`.execute(db);
    await sql `DROP INDEX IF EXISTS investigation_logs_timestamp_idx`.execute(db);
    await sql `DROP INDEX IF EXISTS investigation_logs_created_at_idx`.execute(db);
    await sql `DROP INDEX IF EXISTS investigation_logs_corporate_uuid_to_status_idx`.execute(db);
    await sql `DROP INDEX IF EXISTS contacts_email_idx`.execute(db);
    await sql `DROP INDEX IF EXISTS contacts_system_role_idx`.execute(db);
    await sql `DROP INDEX IF EXISTS subsidiaries_company_name_idx`.execute(db);
    await sql `DROP INDEX IF EXISTS subsidiaries_reg_number_idx`.execute(db);
    console.log('✅ Performance indexes removed successfully');
}
//# sourceMappingURL=011_add_performance_indexes.js.map