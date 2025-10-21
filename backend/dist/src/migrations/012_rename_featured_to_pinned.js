import { sql } from 'kysely';
export async function up(db) {
    await sql `ALTER TABLE corporates ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT FALSE`.execute(db);
    await sql `UPDATE corporates SET pinned = featured`.execute(db);
    await sql `CREATE INDEX IF NOT EXISTS corporates_pinned_idx ON corporates(pinned)`.execute(db);
}
export async function down(db) {
    await sql `DROP INDEX IF EXISTS corporates_pinned_idx`.execute(db);
    await sql `ALTER TABLE corporates DROP COLUMN IF EXISTS pinned`.execute(db);
}
//# sourceMappingURL=012_rename_featured_to_pinned.js.map