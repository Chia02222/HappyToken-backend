"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(db) {
    await db.schema
        .createTable('subsidiaries')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('corporate_id', 'integer', (col) => col.notNull().references('corporates.id').onDelete('cascade'))
        .addColumn('company_name', 'varchar(255)', (col) => col.notNull())
        .addColumn('reg_number', 'varchar(50)', (col) => col.notNull())
        .addColumn('office_address1', 'varchar(255)', (col) => col.notNull())
        .addColumn('office_address2', 'varchar(255)')
        .addColumn('postcode', 'varchar(20)', (col) => col.notNull())
        .addColumn('city', 'varchar(100)', (col) => col.notNull())
        .addColumn('state', 'varchar(100)', (col) => col.notNull())
        .addColumn('country', 'varchar(100)', (col) => col.notNull().defaultTo('Malaysia'))
        .addColumn('website', 'varchar(255)')
        .addColumn('account_note', 'text')
        .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo('CURRENT_TIMESTAMP'))
        .addColumn('updated_at', 'timestamp', (col) => col.notNull().defaultTo('CURRENT_TIMESTAMP'))
        .execute();
}
async function down(db) {
    await db.schema.dropTable('subsidiaries').execute();
}
//# sourceMappingURL=003_create_subsidiaries_table.js.map