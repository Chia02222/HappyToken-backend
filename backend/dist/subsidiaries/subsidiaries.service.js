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
    async addSubsidiary(subsidiaryData) {
        console.log('addSubsidiary called with:', subsidiaryData);
        const { id: _id, ...insertData } = subsidiaryData;
        const inserted = await this.db
            .insertInto('subsidiaries')
            .values({
            ...insertData,
            created_at: (0, kysely_1.sql) `date_trunc('second', now())::timestamp(0)`,
            updated_at: (0, kysely_1.sql) `date_trunc('second', now())::timestamp(0)`,
        })
            .returningAll()
            .executeTakeFirst();
        return inserted;
    }
    async updateSubsidiary(id, subsidiaryData) {
        console.log('updateSubsidiary called with:', { id, subsidiaryData });
        const { id: _subsidiaryId, ...updateData } = subsidiaryData;
        const updated = await this.db
            .updateTable('subsidiaries')
            .set({
            ...updateData,
            updated_at: (0, kysely_1.sql) `date_trunc('second', now())::timestamp(0)`,
        })
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirst();
        return updated;
    }
    async deleteSubsidiary(id) {
        console.log('deleteSubsidiary called with id:', id);
        await this.db.deleteFrom('subsidiaries').where('id', '=', id).execute();
        return { success: true };
    }
};
exports.SubsidiariesService = SubsidiariesService;
exports.SubsidiariesService = SubsidiariesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], SubsidiariesService);
//# sourceMappingURL=subsidiaries.service.js.map