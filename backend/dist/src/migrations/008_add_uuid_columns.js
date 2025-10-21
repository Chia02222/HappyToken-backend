import { sql } from 'kysely';
export async function up(db) {
    await sql `CREATE EXTENSION IF NOT EXISTS pgcrypto`.execute(db);
    await sql `ALTER TABLE corporates ADD COLUMN IF NOT EXISTS uuid uuid DEFAULT gen_random_uuid()`.execute(db);
    await sql `ALTER TABLE contacts ADD COLUMN IF NOT EXISTS uuid uuid DEFAULT gen_random_uuid()`.execute(db);
    await sql `ALTER TABLE subsidiaries ADD COLUMN IF NOT EXISTS uuid uuid DEFAULT gen_random_uuid()`.execute(db);
    await sql `ALTER TABLE investigation_logs ADD COLUMN IF NOT EXISTS uuid uuid DEFAULT gen_random_uuid()`.execute(db);
    await sql `ALTER TABLE contacts ADD COLUMN IF NOT EXISTS corporate_uuid uuid`.execute(db);
    await sql `ALTER TABLE subsidiaries ADD COLUMN IF NOT EXISTS corporate_uuid uuid`.execute(db);
    await sql `ALTER TABLE investigation_logs ADD COLUMN IF NOT EXISTS corporate_uuid uuid`.execute(db);
    await sql `
    UPDATE contacts c
    SET corporate_uuid = corp.uuid
    FROM corporates corp
    WHERE c.corporate_id = corp.id
      AND (c.corporate_uuid IS NULL OR c.corporate_uuid <> corp.uuid)
  `.execute(db);
    await sql `
    UPDATE subsidiaries s
    SET corporate_uuid = corp.uuid
    FROM corporates corp
    WHERE s.corporate_id = corp.id
      AND (s.corporate_uuid IS NULL OR s.corporate_uuid <> corp.uuid)
  `.execute(db);
    await sql `
    UPDATE investigation_logs l
    SET corporate_uuid = corp.uuid
    FROM corporates corp
    WHERE l.corporate_id = corp.id
      AND (l.corporate_uuid IS NULL OR l.corporate_uuid <> corp.uuid)
  `.execute(db);
    await sql `CREATE UNIQUE INDEX IF NOT EXISTS corporates_uuid_uq ON corporates(uuid)`.execute(db);
    await sql `CREATE UNIQUE INDEX IF NOT EXISTS contacts_uuid_uq ON contacts(uuid)`.execute(db);
    await sql `CREATE UNIQUE INDEX IF NOT EXISTS subsidiaries_uuid_uq ON subsidiaries(uuid)`.execute(db);
    await sql `CREATE UNIQUE INDEX IF NOT EXISTS investigation_logs_uuid_uq ON investigation_logs(uuid)`.execute(db);
    await sql `CREATE INDEX IF NOT EXISTS contacts_corporate_uuid_idx ON contacts(corporate_uuid)`.execute(db);
    await sql `CREATE INDEX IF NOT EXISTS subsidiaries_corporate_uuid_idx ON subsidiaries(corporate_uuid)`.execute(db);
    await sql `CREATE INDEX IF NOT EXISTS investigation_logs_corporate_uuid_idx ON investigation_logs(corporate_uuid)`.execute(db);
}
export async function down(db) {
    await sql `DROP INDEX IF EXISTS investigation_logs_corporate_uuid_idx`.execute(db);
    await sql `DROP INDEX IF EXISTS subsidiaries_corporate_uuid_idx`.execute(db);
    await sql `DROP INDEX IF EXISTS contacts_corporate_uuid_idx`.execute(db);
    await sql `DROP INDEX IF EXISTS investigation_logs_uuid_uq`.execute(db);
    await sql `DROP INDEX IF EXISTS subsidiaries_uuid_uq`.execute(db);
    await sql `DROP INDEX IF EXISTS contacts_uuid_uq`.execute(db);
    await sql `DROP INDEX IF EXISTS corporates_uuid_uq`.execute(db);
    await sql `ALTER TABLE investigation_logs DROP COLUMN IF EXISTS corporate_uuid`.execute(db);
    await sql `ALTER TABLE subsidiaries DROP COLUMN IF EXISTS corporate_uuid`.execute(db);
    await sql `ALTER TABLE contacts DROP COLUMN IF EXISTS corporate_uuid`.execute(db);
    await sql `ALTER TABLE investigation_logs DROP COLUMN IF EXISTS uuid`.execute(db);
    await sql `ALTER TABLE subsidiaries DROP COLUMN IF EXISTS uuid`.execute(db);
    await sql `ALTER TABLE contacts DROP COLUMN IF EXISTS uuid`.execute(db);
    await sql `ALTER TABLE corporates DROP COLUMN IF EXISTS uuid`.execute(db);
}
//# sourceMappingURL=008_add_uuid_columns.js.map