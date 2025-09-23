import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable('corporates')
    .addColumn('secondary_approver_id', 'uuid', (col) =>
      col.references('contacts.id').onDelete('set null')
    )
    .execute();

  // Optional backfill: pick the latest contact with system_role = 'secondary_approver' per corporate
  await sql`
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

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable('corporates')
    .dropColumn('secondary_approver_id')
    .execute();
}


