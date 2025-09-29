"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const kysely_1 = require("kysely");
async function up(db) {
    await (0, kysely_1.sql) `ALTER TABLE corporates ALTER COLUMN agreement_from TYPE date USING (agreement_from::date)`.execute(db);
    await (0, kysely_1.sql) `ALTER TABLE corporates ALTER COLUMN agreement_to TYPE date USING (agreement_to::date)`.execute(db);
}
async function down(db) {
    await (0, kysely_1.sql) `ALTER TABLE corporates ALTER COLUMN agreement_from TYPE timestamp USING (agreement_from::timestamp)`.execute(db);
    await (0, kysely_1.sql) `ALTER TABLE corporates ALTER COLUMN agreement_to TYPE timestamp USING (agreement_to::timestamp)`.execute(db);
}
//# sourceMappingURL=007_change_agreement_dates_to_date.js.map