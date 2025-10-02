import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  // Add new column pinned with default false, then backfill from featured if exists
  await sql`ALTER TABLE corporates ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT FALSE`.execute(db);
  // Copy values from featured to pinned if featured exists
  await sql`UPDATE corporates SET pinned = featured`.execute(db);
  // Create index for pinned
  await sql`CREATE INDEX IF NOT EXISTS corporates_pinned_idx ON corporates(pinned)`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Best-effort rollback: drop index and column
  await sql`DROP INDEX IF EXISTS corporates_pinned_idx`.execute(db);
  await sql`ALTER TABLE corporates DROP COLUMN IF EXISTS pinned`.execute(db);
}


