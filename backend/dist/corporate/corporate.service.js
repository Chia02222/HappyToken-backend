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
let CorporateService = class CorporateService {
    dbService;
    constructor(dbService) {
        this.dbService = dbService;
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
            investigationLog: investigationLogs,
        };
    }
    async create(corporateData) {
        const inserted = await this.db
            .insertInto('corporates')
            .values({
            company_name: corporateData.company_name,
            reg_number: corporateData.reg_number,
            status: corporateData.status,
            office_address1: corporateData.office_address1,
            office_address2: corporateData.office_address2,
            postcode: corporateData.postcode,
            city: corporateData.city,
            state: corporateData.state,
            country: corporateData.country,
            website: corporateData.website,
            account_note: corporateData.account_note,
            billing_same_as_official: corporateData.billing_same_as_official,
            billing_address1: corporateData.billing_address1,
            billing_address2: corporateData.billing_address2,
            billing_postcode: corporateData.billing_postcode,
            billing_city: corporateData.billing_city,
            billing_state: corporateData.billing_state,
            billing_country: corporateData.billing_country,
            company_tin: corporateData.company_tin,
            sst_number: corporateData.sst_number,
            agreement_from: corporateData.agreement_from,
            agreement_to: corporateData.agreement_to,
            credit_limit: corporateData.credit_limit,
            credit_terms: corporateData.credit_terms,
            transaction_fee: corporateData.transaction_fee,
            late_payment_interest: corporateData.late_payment_interest,
            white_labeling_fee: corporateData.white_labeling_fee,
            custom_feature_fee: corporateData.custom_feature_fee,
            agreed_to_generic_terms: corporateData.agreed_to_generic_terms,
            agreed_to_commercial_terms: corporateData.agreed_to_commercial_terms,
            first_approval_confirmation: corporateData.first_approval_confirmation,
            second_approval_confirmation: corporateData.second_approval_confirmation,
            created_at: (0, kysely_1.sql) `now()`,
            updated_at: (0, kysely_1.sql) `now()`,
        })
            .returningAll()
            .executeTakeFirst();
        return inserted;
    }
    async update(id, updateData) {
        const { contacts, subsidiaries, contactIdsToDelete, subsidiaryIdsToDelete, ...corporateUpdateData } = updateData;
        const updatedCorporate = await this.db
            .updateTable('corporates')
            .set({
            ...corporateUpdateData,
            updated_at: (0, kysely_1.sql) `now()`,
        })
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirst();
        if (!updatedCorporate) {
            return null;
        }
        if (contacts) {
            for (const contact of contacts) {
                if (contact.id) {
                    await this.updateContact(contact.id, contact);
                }
                else {
                    await this.addContact(id, contact);
                }
            }
        }
        if (contactIdsToDelete) {
            for (const contactId of contactIdsToDelete) {
                await this.deleteContact(contactId);
            }
        }
        if (subsidiaries) {
            for (const subsidiary of subsidiaries) {
                if (subsidiary.id) {
                    await this.updateSubsidiary(subsidiary.id, subsidiary);
                }
                else {
                    await this.addSubsidiary(id, subsidiary);
                }
            }
        }
        if (subsidiaryIdsToDelete) {
            for (const subsidiaryId of subsidiaryIdsToDelete) {
                await this.deleteSubsidiary(subsidiaryId);
            }
        }
        return this.findById(id);
    }
    async delete(id) {
        await this.db.deleteFrom('corporates').where('id', '=', id).execute();
        return { success: true };
    }
    async addContact(corporateId, contactData) {
        const inserted = await this.db
            .insertInto('contacts')
            .values({
            corporate_id: corporateId,
            salutation: contactData.salutation,
            first_name: contactData.first_name,
            last_name: contactData.last_name,
            contact_number: contactData.contact_number,
            email: contactData.email,
            company_role: contactData.company_role,
            system_role: contactData.system_role,
            created_at: (0, kysely_1.sql) `now()`,
            updated_at: (0, kysely_1.sql) `now()`,
        })
            .returningAll()
            .executeTakeFirst();
        return inserted;
    }
    async addSubsidiary(corporateId, subsidiaryData) {
        const inserted = await this.db
            .insertInto('subsidiaries')
            .values({
            corporate_id: corporateId,
            company_name: subsidiaryData.company_name,
            reg_number: subsidiaryData.reg_number,
            office_address1: subsidiaryData.office_address1 ?? '',
            office_address2: subsidiaryData.office_address2 ?? null,
            postcode: subsidiaryData.postcode,
            city: subsidiaryData.city,
            state: subsidiaryData.state,
            country: subsidiaryData.country,
            website: subsidiaryData.website ?? '',
            account_note: subsidiaryData.account_note ?? '',
            created_at: (0, kysely_1.sql) `now()`,
            updated_at: (0, kysely_1.sql) `now()`,
        })
            .returningAll()
            .executeTakeFirst();
        return inserted;
    }
    async addInvestigationLog(corporateId, logData) {
        const inserted = await this.db
            .insertInto('investigation_logs')
            .values({
            corporate_id: corporateId,
            timestamp: logData.timestamp,
            note: logData.note ?? null,
            from_status: logData.from_status ?? null,
            to_status: logData.to_status ?? null,
            created_at: (0, kysely_1.sql) `now()`,
        })
            .returningAll()
            .executeTakeFirst();
        return inserted;
    }
    async updateContact(id, contactData) {
        const updated = await this.db
            .updateTable('contacts')
            .set({
            ...contactData,
            updated_at: (0, kysely_1.sql) `now()`,
        })
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirst();
        return updated;
    }
    async deleteContact(id) {
        await this.db.deleteFrom('contacts').where('id', '=', id).execute();
        return { success: true };
    }
    async updateSubsidiary(id, subsidiaryData) {
        const updated = await this.db
            .updateTable('subsidiaries')
            .set({
            ...subsidiaryData,
            updated_at: (0, kysely_1.sql) `now()`,
        })
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirst();
        return updated;
    }
    async deleteSubsidiary(id) {
        await this.db.deleteFrom('subsidiaries').where('id', '=', id).execute();
        return { success: true };
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
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], CorporateService);
//# sourceMappingURL=corporate.service.js.map