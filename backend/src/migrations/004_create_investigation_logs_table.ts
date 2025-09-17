import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('investigation_logs')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('corporate_id', 'uuid', (col) => col.notNull().references('corporates.id').onDelete('cascade'))
    .addColumn('timestamp', 'timestamp', (col) => col.notNull())
    .addColumn('note', 'text')
    .addColumn('from_status', 'varchar(50)')
    .addColumn('to_status', 'varchar(50)')
    .addColumn('created_at', 'timestamp(0)', (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('investigation_logs').execute();
}
