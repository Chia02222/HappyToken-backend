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
exports.CorporateService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const kysely_1 = require("kysely");
const contacts_service_1 = require("../contacts/contacts.service");
const subsidiaries_service_1 = require("../subsidiaries/subsidiaries.service");
let CorporateService = class CorporateService {
    dbService;
    contactsService;
    subsidiariesService;
    constructor(dbService, contactsService, subsidiariesService) {
        this.dbService = dbService;
        this.contactsService = contactsService;
        this.subsidiariesService = subsidiariesService;
    }
    get db() {
        return this.dbService.getDb();
    }
    async findAll() {
        return await this.db
            .selectFrom('corporates')
            .selectAll()
            .orderBy('created_at', 'desc')
            .execute();
    }
    async findById(id) {
        const corporate = await this.db
            .selectFrom('corporates')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();
        if (!corporate) {
            return null;
        }
        const [contacts, subsidiaries, investigationLogs] = await Promise.all([
            this.db.selectFrom('contacts').selectAll().where('corporate_id', '=', id).execute(),
            this.db.selectFrom('subsidiaries').selectAll().where('corporate_id', '=', id).execute(),
            this.db
                .selectFrom('investigation_logs')
                .selectAll()
                .where('corporate_id', '=', id)
                .orderBy('timestamp', 'desc')
                .execute(),
        ]);
        return {
            ...corporate,
            contacts,
            subsidiaries,
            investigation_log: investigationLogs,
        };
    }
    async create(corporateData) {
        const { contacts, subsidiaries, investigation_log, ...corporateBaseData } = corporateData;
        const corporateInsertData = {
            ...corporateBaseData,
            created_at: (0, kysely_1.sql) `date_trunc('second', now())::timestamp(0)`,
            updated_at: (0, kysely_1.sql) `date_trunc('second', now())::timestamp(0)`,
        };
        const inserted = await this.db
            .insertInto('corporates')
            .values(corporateInsertData)
            .returningAll()
            .executeTakeFirst();
        if (!inserted) {
            throw new Error('Failed to create corporate record.');
        }
        if (contacts) {
            for (const contact of contacts) {
                await this.contactsService.addContact({ ...contact, corporate_id: inserted.id });
            }
        }
        if (subsidiaries) {
            for (const subsidiary of subsidiaries) {
                await this.subsidiariesService.addSubsidiary({ ...subsidiary, corporate_id: inserted.id });
            }
        }
        return inserted;
    }
    async update(id, updateData) {
        console.log('CorporateService.update called with id:', id);
        try {
            console.log('Raw updateData:', JSON.stringify(updateData));
        }
        catch { }
        const { contacts, subsidiaries, contactIdsToDelete, subsidiaryIdsToDelete, investigation_log, id: _ignoreId, ...corporateUpdateData } = updateData;
        console.log('Derived corporateUpdateData keys:', Object.keys(corporateUpdateData));
        console.log('contactIdsToDelete:', contactIdsToDelete);
        console.log('subsidiaryIdsToDelete:', subsidiaryIdsToDelete);
        const updatedCorporate = await this.db
            .updateTable('corporates')
            .set({
            ...corporateUpdateData,
            agreement_from: corporateUpdateData.agreement_from === '' ? null : corporateUpdateData.agreement_from,
            agreement_to: corporateUpdateData.agreement_to === '' ? null : corporateUpdateData.agreement_to,
            updated_at: (0, kysely_1.sql) `date_trunc('second', now())::timestamp(0)`,
        })
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirst();
        if (!updatedCorporate) {
            return null;
        }
        const isUuid = (value) => typeof value === 'string' && /^[0-9a-fA-F-]{36}$/.test(value);
        if (contacts) {
            for (const contact of contacts) {
                if (isUuid(contact.id)) {
                    await this.contactsService.updateContact(contact.id, contact);
                }
                else {
                    await this.contactsService.addContact({ ...contact, corporate_id: id });
                }
            }
        }
        if (contactIdsToDelete) {
            for (const contactId of contactIdsToDelete) {
                console.log('Attempting to delete contactId:', contactId);
                if (!contactId) {
                    console.warn('Skipping empty contactId');
                    continue;
                }
                await this.contactsService.deleteContact(contactId);
            }
        }
        if (subsidiaries) {
            for (const subsidiary of subsidiaries) {
                if (isUuid(subsidiary.id)) {
                    await this.subsidiariesService.updateSubsidiary(subsidiary.id, subsidiary);
                }
                else {
                    await this.subsidiariesService.addSubsidiary({ ...subsidiary, corporate_id: id });
                }
            }
        }
        if (subsidiaryIdsToDelete) {
            for (const subsidiaryId of subsidiaryIdsToDelete) {
                console.log('Attempting to delete subsidiaryId:', subsidiaryId);
                if (!subsidiaryId) {
                    console.warn('Skipping empty subsidiaryId');
                    continue;
                }
                await this.subsidiariesService.deleteSubsidiary(subsidiaryId);
            }
        }
        return this.findById(id);
    }
    async delete(id) {
        await this.db.deleteFrom('corporates').where('id', '=', id).execute();
        return { success: true };
    }
    async addInvestigationLog(corporateId, logData) {
        console.log('addInvestigationLog called with:', { corporateId, logData });
        try {
            const inserted = await this.db
                .insertInto('investigation_logs')
                .values({
                corporate_id: corporateId,
                timestamp: logData.timestamp,
                note: logData.note ?? null,
                from_status: logData.from_status ?? null,
                to_status: logData.to_status ?? null,
                created_at: (0, kysely_1.sql) `date_trunc('second', now())::timestamp(0)`,
            })
                .returningAll()
                .executeTakeFirst();
            console.log('Investigation log inserted:', inserted);
            return inserted;
        }
        catch (error) {
            console.error('Error inserting investigation log:', error);
            throw error;
        }
    }
    async updateStatus(id, status, note) {
        const corporate = await this.findById(id);
        if (!corporate) {
            throw new Error('Corporate not found');
        }
        if (note) {
            await this.addInvestigationLog(id, {
                timestamp: new Date().toISOString(),
                note,
                from_status: corporate.status,
                to_status: status,
            });
        }
        return await this.update(id, { status: status });
    }
};
exports.CorporateService = CorporateService;
exports.CorporateService = CorporateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        contacts_service_1.ContactsService,
        subsidiaries_service_1.SubsidiariesService])
], CorporateService);
//# sourceMappingURL=corporate.service.js.map