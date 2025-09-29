import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  // Convert agreement_from and agreement_to to DATE to avoid timezone shifts
  await sql`ALTER TABLE corporates ALTER COLUMN agreement_from TYPE date USING (agreement_from::date)`.execute(db);
  await sql`ALTER TABLE corporates ALTER COLUMN agreement_to TYPE date USING (agreement_to::date)`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Revert back to timestamp without time zone
  await sql`ALTER TABLE corporates ALTER COLUMN agreement_from TYPE timestamp USING (agreement_from::timestamp)`.execute(db);
  await sql`ALTER TABLE corporates ALTER COLUMN agreement_to TYPE timestamp USING (agreement_to::timestamp)`.execute(db);
}


