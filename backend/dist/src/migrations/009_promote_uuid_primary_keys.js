import { sql } from 'kysely';
export async function up(db) {
    await sql `ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_corporate_id_fkey`.execute(db);
    await sql `ALTER TABLE subsidiaries DROP CONSTRAINT IF EXISTS subsidiaries_corporate_id_fkey`.execute(db);
    await sql `ALTER TABLE investigation_logs DROP CONSTRAINT IF EXISTS investigation_logs_corporate_id_fkey`.execute(db);
    await sql `ALTER TABLE corporates ALTER COLUMN uuid SET NOT NULL`.execute(db);
    await sql `ALTER TABLE corporates DROP CONSTRAINT IF EXISTS corporates_pkey`.execute(db);
    await sql `ALTER TABLE corporates ADD CONSTRAINT corporates_pkey PRIMARY KEY (uuid)`.execute(db);
    await sql `ALTER TABLE corporates DROP COLUMN IF EXISTS id`.execute(db);
    await sql `ALTER TABLE contacts ALTER COLUMN corporate_uuid SET NOT NULL`.execute(db);
    await sql `ALTER TABLE contacts ADD CONSTRAINT contacts_corporate_uuid_fkey FOREIGN KEY (corporate_uuid) REFERENCES corporates(uuid) ON DELETE CASCADE`.execute(db);
    await sql `ALTER TABLE contacts DROP COLUMN IF EXISTS corporate_id`.execute(db);
    await sql `ALTER TABLE subsidiaries ALTER COLUMN corporate_uuid SET NOT NULL`.execute(db);
    await sql `ALTER TABLE subsidiaries ADD CONSTRAINT subsidiaries_corporate_uuid_fkey FOREIGN KEY (corporate_uuid) REFERENCES corporates(uuid) ON DELETE CASCADE`.execute(db);
    await sql `ALTER TABLE subsidiaries DROP COLUMN IF EXISTS corporate_id`.execute(db);
    await sql `ALTER TABLE investigation_logs ALTER COLUMN corporate_uuid SET NOT NULL`.execute(db);
    await sql `ALTER TABLE investigation_logs ADD CONSTRAINT investigation_logs_corporate_uuid_fkey FOREIGN KEY (corporate_uuid) REFERENCES corporates(uuid) ON DELETE CASCADE`.execute(db);
    await sql `ALTER TABLE investigation_logs DROP COLUMN IF EXISTS corporate_id`.execute(db);
    await sql `ALTER TABLE investigation_logs ALTER COLUMN uuid SET NOT NULL`.execute(db);
    await sql `ALTER TABLE investigation_logs DROP CONSTRAINT IF EXISTS investigation_logs_pkey`.execute(db);
    await sql `ALTER TABLE investigation_logs ADD CONSTRAINT investigation_logs_pkey PRIMARY KEY (uuid)`.execute(db);
    await sql `ALTER TABLE investigation_logs DROP COLUMN IF EXISTS id`.execute(db);
}
export async function down(db) {
    await sql `ALTER TABLE investigation_logs ADD COLUMN IF NOT EXISTS id serial`.execute(db);
    await sql `ALTER TABLE investigation_logs DROP CONSTRAINT IF EXISTS investigation_logs_pkey`.execute(db);
    await sql `ALTER TABLE investigation_logs ADD CONSTRAINT investigation_logs_pkey PRIMARY KEY (id)`.execute(db);
    await sql `ALTER TABLE investigation_logs DROP CONSTRAINT IF EXISTS investigation_logs_corporate_uuid_fkey`.execute(db);
    await sql `ALTER TABLE investigation_logs ADD COLUMN IF NOT EXISTS corporate_id integer`.execute(db);
    await sql `ALTER TABLE corporates ADD COLUMN IF NOT EXISTS id serial`.execute(db);
    await sql `ALTER TABLE corporates DROP CONSTRAINT IF EXISTS corporates_pkey`.execute(db);
    await sql `ALTER TABLE corporates ADD CONSTRAINT corporates_pkey PRIMARY KEY (id)`.execute(db);
    await sql `ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_corporate_uuid_fkey`.execute(db);
    await sql `ALTER TABLE contacts ADD COLUMN IF NOT EXISTS corporate_id integer`.execute(db);
    await sql `ALTER TABLE contacts ADD CONSTRAINT contacts_corporate_id_fkey FOREIGN KEY (corporate_id) REFERENCES corporates(id) ON DELETE CASCADE`.execute(db);
    await sql `ALTER TABLE subsidiaries DROP CONSTRAINT IF EXISTS subsidiaries_corporate_uuid_fkey`.execute(db);
    await sql `ALTER TABLE subsidiaries ADD COLUMN IF NOT EXISTS corporate_id integer`.execute(db);
    await sql `ALTER TABLE subsidiaries ADD CONSTRAINT subsidiaries_corporate_id_fkey FOREIGN KEY (corporate_id) REFERENCES corporates(id) ON DELETE CASCADE`.execute(db);
    await sql `ALTER TABLE investigation_logs DROP CONSTRAINT IF EXISTS investigation_logs_uuid_uq`.execute(db);
    await sql `ALTER TABLE contacts DROP COLUMN IF EXISTS corporate_uuid`.execute(db);
    await sql `ALTER TABLE subsidiaries DROP COLUMN IF EXISTS corporate_uuid`.execute(db);
    await sql `ALTER TABLE investigation_logs DROP COLUMN IF EXISTS corporate_uuid`.execute(db);
    await sql `ALTER TABLE investigation_logs DROP COLUMN IF EXISTS uuid`.execute(db);
    await sql `ALTER TABLE corporates DROP COLUMN IF EXISTS uuid`.execute(db);
}
//# sourceMappingURL=009_promote_uuid_primary_keys.js.map