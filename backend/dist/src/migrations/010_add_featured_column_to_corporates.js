import { sql } from 'kysely';
export async function up(db) {
    await sql `ALTER TABLE corporates ADD COLUMN featured BOOLEAN DEFAULT FALSE`.execute(db);
}
export async function down(db) {
    await sql `ALTER TABLE corporates DROP COLUMN IF EXISTS featured`.execute(db);
}
//# sourceMappingURL=010_add_featured_column_to_corporates.js.map