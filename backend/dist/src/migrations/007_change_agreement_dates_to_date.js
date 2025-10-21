import { sql } from 'kysely';
export async function up(db) {
    await sql `ALTER TABLE corporates ALTER COLUMN agreement_from TYPE date USING (agreement_from::date)`.execute(db);
    await sql `ALTER TABLE corporates ALTER COLUMN agreement_to TYPE date USING (agreement_to::date)`.execute(db);
}
export async function down(db) {
    await sql `ALTER TABLE corporates ALTER COLUMN agreement_from TYPE timestamp USING (agreement_from::timestamp)`.execute(db);
    await sql `ALTER TABLE corporates ALTER COLUMN agreement_to TYPE timestamp USING (agreement_to::timestamp)`.execute(db);
}
//# sourceMappingURL=007_change_agreement_dates_to_date.js.map