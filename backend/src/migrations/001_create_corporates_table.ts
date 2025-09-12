import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Ensure pgcrypto for gen_random_uuid()
  await sql`create extension if not exists "pgcrypto"`.execute(db);

  await db.schema
    .createTable('corporates')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('company_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('reg_number', 'varchar(50)', (col) => col.notNull().unique())
    .addColumn('status', 'varchar(50)', (col) => col.notNull())
    .addColumn('office_address1', 'varchar(255)', (col) => col.notNull())
    .addColumn('office_address2', 'varchar(255)')
    .addColumn('postcode', 'varchar(20)', (col) => col.notNull())
    .addColumn('city', 'varchar(100)', (col) => col.notNull())
    .addColumn('state', 'varchar(100)', (col) => col.notNull())
    .addColumn('country', 'varchar(100)', (col) => col.notNull().defaultTo('Malaysia'))
    .addColumn('website', 'varchar(255)')
    .addColumn('account_note', 'text')
    .addColumn('billing_same_as_official', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('billing_address1', 'varchar(255)')
    .addColumn('billing_address2', 'varchar(255)')
    .addColumn('billing_postcode', 'varchar(20)')
    .addColumn('billing_city', 'varchar(100)')
    .addColumn('billing_state', 'varchar(100)')
    .addColumn('billing_country', 'varchar(100)', (col) => col.defaultTo('Malaysia'))
    .addColumn('company_tin', 'varchar(50)')
    .addColumn('sst_number', 'varchar(50)')
    .addColumn('agreement_from', 'date')
    .addColumn('agreement_to', 'date')
    .addColumn('credit_limit', 'varchar(20)', (col) => col.defaultTo('0.00'))
    .addColumn('credit_terms', 'varchar(10)')
    .addColumn('transaction_fee', 'varchar(10)')
    .addColumn('late_payment_interest', 'varchar(10)')
    .addColumn('white_labeling_fee', 'varchar(10)')
    .addColumn('custom_feature_fee', 'varchar(20)', (col) => col.defaultTo('0.00'))
    .addColumn('agreed_to_generic_terms', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('agreed_to_commercial_terms', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('first_approval_confirmation', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('second_approval_confirmation', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('created_at', 'timestamp(0)', (col) => col.notNull())
    .addColumn('updated_at', 'timestamp(0)', (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('corporates').execute();
}
