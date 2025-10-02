import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`ALTER TABLE corporates ADD COLUMN featured BOOLEAN DEFAULT FALSE`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`ALTER TABLE corporates DROP COLUMN IF EXISTS featured`.execute(db);
}
