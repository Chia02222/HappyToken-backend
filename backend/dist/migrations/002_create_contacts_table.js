"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(db) {
    await db.schema
        .createTable('contacts')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('corporate_id', 'integer', (col) => col.notNull().references('corporates.id').onDelete('cascade'))
        .addColumn('salutation', 'varchar(10)', (col) => col.notNull())
        .addColumn('first_name', 'varchar(100)', (col) => col.notNull())
        .addColumn('last_name', 'varchar(100)', (col) => col.notNull())
        .addColumn('contact_number', 'varchar(20)', (col) => col.notNull())
        .addColumn('email', 'varchar(255)', (col) => col.notNull())
        .addColumn('company_role', 'varchar(100)', (col) => col.notNull())
        .addColumn('system_role', 'varchar(50)', (col) => col.notNull())
        .addColumn('created_at', 'timestamp(0)', (col) => col.notNull())
        .addColumn('updated_at', 'timestamp(0)', (col) => col.notNull())
        .execute();
}
async function down(db) {
    await db.schema.dropTable('contacts').execute();
}
//# sourceMappingURL=002_create_contacts_table.js.map