"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(db) {
    await db.schema
        .createTable('investigation_logs')
        .addColumn('id', 'bigserial', (col) => col.primaryKey())
        .addColumn('corporate_id', 'bigint', (col) => col.notNull().references('corporates.id').onDelete('cascade'))
        .addColumn('timestamp', 'timestamp', (col) => col.notNull())
        .addColumn('note', 'text')
        .addColumn('from_status', 'varchar(50)')
        .addColumn('to_status', 'varchar(50)')
        .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo('CURRENT_TIMESTAMP'))
        .execute();
}
async function down(db) {
    await db.schema.dropTable('investigation_logs').execute();
}
//# sourceMappingURL=004_create_investigation_logs_table.js.map