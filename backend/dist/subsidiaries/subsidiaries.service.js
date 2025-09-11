"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubsidiariesService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const kysely_1 = require("kysely");
let SubsidiariesService = class SubsidiariesService {
    dbService;
    constructor(dbService) {
        this.dbService = dbService;
    }
    get db() {
        return this.dbService.getDb();
    }
    async findAll(params = {}) {
        const { corporate_id, limit = 50, offset = 0 } = params;
        let q = this.db.selectFrom('subsidiaries').selectAll().orderBy('created_at', 'desc');
        if (corporate_id)
            q = q.where('corporate_id', '=', corporate_id);
        return await q.limit(limit).offset(offset).execute();
    }
    async findById(id) {
        const row = await this.db.selectFrom('subsidiaries').selectAll().where('id', '=', id).executeTakeFirst();
        if (!row)
            throw new common_1.NotFoundException('Subsidiary not found');
        return row;
    }
    async create(data) {
        const inserted = await this.db
            .insertInto('subsidiaries')
            .values({
            corporate_id: data.corporate_id,
            company_name: data.company_name,
            reg_number: data.reg_number,
            office_address1: data.office_address1,
            office_address2: data.office_address2,
            postcode: data.postcode,
            city: data.city,
            state: data.state,
            country: data.country,
            website: data.website,
            account_note: data.account_note,
            created_at: (0, kysely_1.sql) `now()`,
            updated_at: (0, kysely_1.sql) `now()`,
        })
            .returningAll()
            .executeTakeFirst();
        return inserted;
    }
    async update(id, data) {
        const updated = await this.db
            .updateTable('subsidiaries')
            .set({ ...data, updated_at: (0, kysely_1.sql) `now()` })
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirst();
        if (!updated)
            throw new common_1.NotFoundException('Subsidiary not found');
        return updated;
    }
    async delete(id) {
        const res = await this.db.deleteFrom('subsidiaries').where('id', '=', id).returning('id').executeTakeFirst();
        if (!res)
            throw new common_1.NotFoundException('Subsidiary not found');
        return { success: true };
    }
};
exports.SubsidiariesService = SubsidiariesService;
exports.SubsidiariesService = SubsidiariesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], SubsidiariesService);
//# sourceMappingURL=subsidiaries.service.js.map