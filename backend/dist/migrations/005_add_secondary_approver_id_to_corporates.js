"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const kysely_1 = require("kysely");
async function up(db) {
    await db.schema
        .alterTable('corporates')
        .addColumn('secondary_approver_id', 'uuid', (col) => col.references('contacts.id').onDelete('set null'))
        .execute();
    await (0, kysely_1.sql) `
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
async function down(db) {
    await db.schema
        .alterTable('corporates')
        .dropColumn('secondary_approver_id')
        .execute();
}
//# sourceMappingURL=005_add_secondary_approver_id_to_corporates.js.map