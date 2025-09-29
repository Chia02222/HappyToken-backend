import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  // 1) Drop child FKs that reference corporates(id)
  await sql`ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_corporate_id_fkey`.execute(db);
  await sql`ALTER TABLE subsidiaries DROP CONSTRAINT IF EXISTS subsidiaries_corporate_id_fkey`.execute(db);
  await sql`ALTER TABLE investigation_logs DROP CONSTRAINT IF EXISTS investigation_logs_corporate_id_fkey`.execute(db);

  // 2) Promote corporates.uuid to primary key
  await sql`ALTER TABLE corporates ALTER COLUMN uuid SET NOT NULL`.execute(db);
  await sql`ALTER TABLE corporates DROP CONSTRAINT IF EXISTS corporates_pkey`.execute(db);
  await sql`ALTER TABLE corporates ADD CONSTRAINT corporates_pkey PRIMARY KEY (uuid)`.execute(db);
  // Drop old integer id
  await sql`ALTER TABLE corporates DROP COLUMN IF EXISTS id`.execute(db);

  // 3) Switch children to use corporate_uuid and enforce FK
  await sql`ALTER TABLE contacts ALTER COLUMN corporate_uuid SET NOT NULL`.execute(db);
  await sql`ALTER TABLE contacts ADD CONSTRAINT contacts_corporate_uuid_fkey FOREIGN KEY (corporate_uuid) REFERENCES corporates(uuid) ON DELETE CASCADE`.execute(db);
  // Drop old column
  await sql`ALTER TABLE contacts DROP COLUMN IF EXISTS corporate_id`.execute(db);

  await sql`ALTER TABLE subsidiaries ALTER COLUMN corporate_uuid SET NOT NULL`.execute(db);
  await sql`ALTER TABLE subsidiaries ADD CONSTRAINT subsidiaries_corporate_uuid_fkey FOREIGN KEY (corporate_uuid) REFERENCES corporates(uuid) ON DELETE CASCADE`.execute(db);
  await sql`ALTER TABLE subsidiaries DROP COLUMN IF EXISTS corporate_id`.execute(db);

  await sql`ALTER TABLE investigation_logs ALTER COLUMN corporate_uuid SET NOT NULL`.execute(db);
  await sql`ALTER TABLE investigation_logs ADD CONSTRAINT investigation_logs_corporate_uuid_fkey FOREIGN KEY (corporate_uuid) REFERENCES corporates(uuid) ON DELETE CASCADE`.execute(db);
  await sql`ALTER TABLE investigation_logs DROP COLUMN IF EXISTS corporate_id`.execute(db);

  // 4) Promote investigation_logs.uuid (amendment id) to primary key
  await sql`ALTER TABLE investigation_logs ALTER COLUMN uuid SET NOT NULL`.execute(db);
  await sql`ALTER TABLE investigation_logs DROP CONSTRAINT IF EXISTS investigation_logs_pkey`.execute(db);
  await sql`ALTER TABLE investigation_logs ADD CONSTRAINT investigation_logs_pkey PRIMARY KEY (uuid)`.execute(db);
  await sql`ALTER TABLE investigation_logs DROP COLUMN IF EXISTS id`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Best-effort rollback: recreate integer id columns and prior FKs

  // 1) investigation_logs: add id back and make it PK
  await sql`ALTER TABLE investigation_logs ADD COLUMN IF NOT EXISTS id serial`.execute(db);
  await sql`ALTER TABLE investigation_logs DROP CONSTRAINT IF EXISTS investigation_logs_pkey`.execute(db);
  await sql`ALTER TABLE investigation_logs ADD CONSTRAINT investigation_logs_pkey PRIMARY KEY (id)`.execute(db);
  // Drop FK to corporate_uuid and add corporate_id back
  await sql`ALTER TABLE investigation_logs DROP CONSTRAINT IF EXISTS investigation_logs_corporate_uuid_fkey`.execute(db);
  await sql`ALTER TABLE investigation_logs ADD COLUMN IF NOT EXISTS corporate_id integer`.execute(db);
  // Note: cannot reliably backfill corporate_id here

  // 2) corporates: add id back and make it PK
  await sql`ALTER TABLE corporates ADD COLUMN IF NOT EXISTS id serial`.execute(db);
  await sql`ALTER TABLE corporates DROP CONSTRAINT IF EXISTS corporates_pkey`.execute(db);
  await sql`ALTER TABLE corporates ADD CONSTRAINT corporates_pkey PRIMARY KEY (id)`.execute(db);

  // 3) children: drop corporate_uuid FK, add back corporate_id FK
  await sql`ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_corporate_uuid_fkey`.execute(db);
  await sql`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS corporate_id integer`.execute(db);
  await sql`ALTER TABLE contacts ADD CONSTRAINT contacts_corporate_id_fkey FOREIGN KEY (corporate_id) REFERENCES corporates(id) ON DELETE CASCADE`.execute(db);

  await sql`ALTER TABLE subsidiaries DROP CONSTRAINT IF EXISTS subsidiaries_corporate_uuid_fkey`.execute(db);
  await sql`ALTER TABLE subsidiaries ADD COLUMN IF NOT EXISTS corporate_id integer`.execute(db);
  await sql`ALTER TABLE subsidiaries ADD CONSTRAINT subsidiaries_corporate_id_fkey FOREIGN KEY (corporate_id) REFERENCES corporates(id) ON DELETE CASCADE`.execute(db);

  // 4) Drop uuid columns as PKs remain on ids
  await sql`ALTER TABLE investigation_logs DROP CONSTRAINT IF EXISTS investigation_logs_uuid_uq`.execute(db);
  await sql`ALTER TABLE contacts DROP COLUMN IF EXISTS corporate_uuid`.execute(db);
  await sql`ALTER TABLE subsidiaries DROP COLUMN IF EXISTS corporate_uuid`.execute(db);
  await sql`ALTER TABLE investigation_logs DROP COLUMN IF EXISTS corporate_uuid`.execute(db);
  await sql`ALTER TABLE investigation_logs DROP COLUMN IF EXISTS uuid`.execute(db);
  await sql`ALTER TABLE corporates DROP COLUMN IF EXISTS uuid`.execute(db);
}


