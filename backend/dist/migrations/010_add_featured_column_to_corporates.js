"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const kysely_1 = require("kysely");
async function up(db) {
    await (0, kysely_1.sql) `ALTER TABLE corporates ADD COLUMN featured BOOLEAN DEFAULT FALSE`.execute(db);
}
async function down(db) {
    await (0, kysely_1.sql) `ALTER TABLE corporates DROP COLUMN IF EXISTS featured`.execute(db);
}
//# sourceMappingURL=010_add_featured_column_to_corporates.js.map