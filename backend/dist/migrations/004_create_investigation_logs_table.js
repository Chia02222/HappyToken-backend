"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const kysely_1 = require("kysely");
async function up(db) {
    await db.schema
        .createTable('investigation_logs')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo((0, kysely_1.sql) `gen_random_uuid()`))
        .addColumn('corporate_id', 'uuid', (col) => col.notNull().references('corporates.id').onDelete('cascade'))
        .addColumn('timestamp', 'timestamp', (col) => col.notNull())
        .addColumn('note', 'text')
        .addColumn('from_status', 'varchar(50)')
        .addColumn('to_status', 'varchar(50)')
        .addColumn('created_at', 'timestamp(0)', (col) => col.notNull())
        .execute();
}
async function down(db) {
    await db.schema.dropTable('investigation_logs').execute();
}
//# sourceMappingURL=004_create_investigation_logs_table.js.map