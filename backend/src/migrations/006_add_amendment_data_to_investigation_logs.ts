import { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable('investigation_logs')
    .addColumn('amendment_data', 'jsonb')
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable('investigation_logs')
    .dropColumn('amendment_data')
    .execute();
}

