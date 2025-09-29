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
exports.ContactsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
const kysely_1 = require("kysely");
let ContactsService = class ContactsService {
    dbService;
    constructor(dbService) {
        this.dbService = dbService;
    }
    get db() {
        return this.dbService.getDb();
    }
    async addContact(contactData) {
        console.log('addContact called with:', contactData);
        const { id: _id, ...contactDataWithoutId } = contactData;
        const insertData = {
            corporate_uuid: contactDataWithoutId.corporate_uuid,
            salutation: contactDataWithoutId.salutation,
            first_name: contactDataWithoutId.first_name,
            last_name: contactDataWithoutId.last_name,
            contact_number: contactDataWithoutId.contact_number,
            email: contactDataWithoutId.email,
            company_role: contactDataWithoutId.company_role,
            system_role: contactDataWithoutId.system_role,
        };
        const dataWithDefaults = {
            ...insertData,
            salutation: insertData.salutation || 'Mr',
            first_name: insertData.first_name || 'N/A',
            last_name: insertData.last_name || 'N/A',
            contact_number: insertData.contact_number || 'N/A',
            email: insertData.email || 'N/A',
            company_role: insertData.company_role || 'N/A',
            system_role: insertData.system_role || 'N/A',
        };
        const inserted = await this.db
            .insertInto('contacts')
            .values({
            ...dataWithDefaults,
            created_at: (0, kysely_1.sql) `date_trunc('second', now())::timestamp(0)`,
            updated_at: (0, kysely_1.sql) `date_trunc('second', now())::timestamp(0)`,
        })
            .returningAll()
            .executeTakeFirst();
        return inserted;
    }
    async updateContact(uuid, contactData) {
        console.log('updateContact called with:', { uuid, contactData });
        const { id: _contactId, ...updateData } = contactData;
        const updated = await this.db
            .updateTable('contacts')
            .set({
            ...updateData,
            updated_at: (0, kysely_1.sql) `date_trunc('second', now())::timestamp(0)`,
        })
            .where('uuid', '=', uuid)
            .returningAll()
            .executeTakeFirst();
        return updated;
    }
    async deleteContact(uuid) {
        console.log('deleteContact called with uuid:', uuid);
        await this.db.deleteFrom('contacts').where('uuid', '=', uuid).execute();
        return { success: true };
    }
};
exports.ContactsService = ContactsService;
exports.ContactsService = ContactsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ContactsService);
//# sourceMappingURL=contacts.service.js.map