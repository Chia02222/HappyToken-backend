"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(db) {
    await db.schema
        .alterTable('investigation_logs')
        .addColumn('amendment_data', 'jsonb')
        .execute();
}
async function down(db) {
    await db.schema
        .alterTable('investigation_logs')
        .dropColumn('amendment_data')
        .execute();
}
//# sourceMappingURL=006_add_amendment_data_to_investigation_logs.js.map