"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const kysely_1 = require("kysely");
async function up(db) {
    await (0, kysely_1.sql) `ALTER TABLE corporates ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT FALSE`.execute(db);
    await (0, kysely_1.sql) `UPDATE corporates SET pinned = featured`.execute(db);
    await (0, kysely_1.sql) `CREATE INDEX IF NOT EXISTS corporates_pinned_idx ON corporates(pinned)`.execute(db);
}
async function down(db) {
    await (0, kysely_1.sql) `DROP INDEX IF EXISTS corporates_pinned_idx`.execute(db);
    await (0, kysely_1.sql) `ALTER TABLE corporates DROP COLUMN IF EXISTS pinned`.execute(db);
}
//# sourceMappingURL=012_rename_featured_to_pinned.js.map