import { sql } from 'kysely';
export async function up(db) {
    await db.schema
        .alterTable('corporates')
        .addColumn('secondary_approver_id', 'uuid', (col) => col.references('contacts.id').onDelete('set null'))
        .execute();
    await sql `
    update corporates c
    set secondary_approver_id = sub.id
    from (
      select distinct on (corporate_id) id, corporate_id
      from contacts
      where system_role = 'secondary_approver'
      order by corporate_id, created_at desc
    ) sub
    where c.secondary_approver_id is null
      and c.id = sub.corporate_id
  `.execute(db);
}
export async function down(db) {
    await db.schema
        .alterTable('corporates')
        .dropColumn('secondary_approver_id')
        .execute();
}
//# sourceMappingURL=005_add_secondary_approver_id_to_corporates.js.map