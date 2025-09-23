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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorporateService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
const kysely_1 = require("kysely");
const contacts_service_1 = require("../contacts/contacts.service");
const subsidiaries_service_1 = require("../subsidiaries/subsidiaries.service");
const resend_service_1 = require("../resend/resend.service");
const schedule_1 = require("@nestjs/schedule");
let CorporateService = class CorporateService {
    dbService;
    contactsService;
    subsidiariesService;
    resendService;
    constructor(dbService, contactsService, subsidiariesService, resendService) {
        this.dbService = dbService;
        this.contactsService = contactsService;
        this.subsidiariesService = subsidiariesService;
        this.resendService = resendService;
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
        const idNum = Number(id);
        const corporate = await this.db
            .selectFrom('corporates')
            .selectAll()
            .where('id', '=', idNum)
            .executeTakeFirst();
        if (!corporate) {
            return null;
        }
        const [contacts, subsidiaries, investigationLogs] = await Promise.all([
            this.db.selectFrom('contacts').selectAll().where('corporate_id', '=', idNum).orderBy('created_at', 'asc').execute(),
            this.db.selectFrom('subsidiaries').selectAll().where('corporate_id', '=', idNum).execute(),
            this.db
                .selectFrom('investigation_logs')
                .selectAll()
                .where('corporate_id', '=', idNum)
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
        const { contacts, subsidiaries, secondary_approver, ...corporateBaseData } = corporateData;
        const corporateInsertData = {
            ...corporateBaseData,
            status: 'Draft',
            agreement_from: corporateBaseData.agreement_from === '' ? null : corporateBaseData.agreement_from,
            agreement_to: corporateBaseData.agreement_to === '' ? null : corporateBaseData.agreement_to,
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
        if (secondary_approver) {
            let secondaryApproverId;
            if (secondary_approver.use_existing_contact && secondary_approver.selected_contact_id) {
                await this.contactsService.updateContact(Number(secondary_approver.selected_contact_id), {
                    salutation: secondary_approver.salutation ?? '',
                    first_name: secondary_approver.first_name ?? '',
                    last_name: secondary_approver.last_name ?? '',
                    company_role: secondary_approver.company_role ?? '',
                    system_role: secondary_approver.system_role ?? '',
                    email: secondary_approver.email ?? '',
                    contact_number: secondary_approver.contact_number ?? '',
                });
                secondaryApproverId = Number(secondary_approver.selected_contact_id);
            }
            else if (!secondary_approver.use_existing_contact) {
                const insertedContact = await this.contactsService.addContact({
                    corporate_id: inserted.id,
                    salutation: secondary_approver.salutation ?? '',
                    first_name: secondary_approver.first_name ?? '',
                    last_name: secondary_approver.last_name ?? '',
                    company_role: secondary_approver.company_role ?? '',
                    system_role: secondary_approver.system_role ?? '',
                    email: secondary_approver.email ?? '',
                    contact_number: secondary_approver.contact_number ?? '',
                });
                secondaryApproverId = insertedContact.id;
            }
            if (secondaryApproverId !== undefined) {
                await this.db
                    .updateTable('corporates')
                    .set({
                    secondary_approver_id: secondaryApproverId,
                    updated_at: (0, kysely_1.sql) `date_trunc('second', now())::timestamp(0)`,
                })
                    .where('id', '=', inserted.id)
                    .execute();
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
        const { investigation_log: _investigation_log, ...restOfUpdateData } = updateData;
        const { id: _updateDtoId, contacts, subsidiaries, contactIdsToDelete, subsidiaryIdsToDelete, secondary_approver: _secondary_approver, ...corporateUpdateData } = restOfUpdateData;
        const idNum = Number(id);
        const secondaryApproverData = updateData.secondary_approver;
        console.log('Derived corporateUpdateData keys:', Object.keys(corporateUpdateData));
        console.log('contactIdsToDelete:', contactIdsToDelete);
        console.log('subsidiaryIdsToDelete:', subsidiaryIdsToDelete);
        if (secondaryApproverData) {
            let secondaryApproverId;
            if (secondaryApproverData.use_existing_contact && secondaryApproverData.selected_contact_id) {
                await this.contactsService.updateContact(Number(secondaryApproverData.selected_contact_id), {
                    salutation: secondaryApproverData.salutation ?? '',
                    first_name: secondaryApproverData.first_name ?? '',
                    last_name: secondaryApproverData.last_name ?? '',
                    company_role: secondaryApproverData.company_role ?? '',
                    system_role: secondaryApproverData.system_role ?? '',
                    email: secondaryApproverData.email ?? '',
                    contact_number: secondaryApproverData.contact_number ?? '',
                });
                secondaryApproverId = Number(secondaryApproverData.selected_contact_id);
            }
            else if (!secondaryApproverData.use_existing_contact) {
                const insertedContact = await this.contactsService.addContact({
                    corporate_id: idNum,
                    salutation: secondaryApproverData.salutation ?? '',
                    first_name: secondaryApproverData.first_name ?? '',
                    last_name: secondaryApproverData.last_name ?? '',
                    company_role: secondaryApproverData.company_role ?? '',
                    system_role: secondaryApproverData.system_role ?? '',
                    email: secondaryApproverData.email ?? '',
                    contact_number: secondaryApproverData.contact_number ?? '',
                });
                secondaryApproverId = insertedContact.id;
            }
            if (secondaryApproverId !== undefined) {
                await this.db
                    .updateTable('corporates')
                    .set({
                    secondary_approver_id: secondaryApproverId,
                    updated_at: (0, kysely_1.sql) `date_trunc('second', now())::timestamp(0)`,
                })
                    .where('id', '=', idNum)
                    .execute();
            }
        }
        const corporateFieldsToUpdate = {
            ...corporateUpdateData,
            agreement_from: corporateUpdateData.agreement_from === '' ? null : corporateUpdateData.agreement_from,
            agreement_to: corporateUpdateData.agreement_to === '' ? null : corporateUpdateData.agreement_to,
            updated_at: (0, kysely_1.sql) `date_trunc('second', now())::timestamp(0)`,
        };
        const updatedCorporate = await this.db
            .updateTable('corporates')
            .set(corporateFieldsToUpdate)
            .where('id', '=', idNum)
            .returningAll()
            .executeTakeFirst();
        if (!updatedCorporate) {
            return null;
        }
        const isUuid = (value) => typeof value === 'string' && /^[0-9a-fA-F-]{36}$/.test(value);
        const isNumericString = (value) => typeof value === 'string' && /^\d+$/.test(value);
        const isClientTempId = (value) => typeof value === 'string' && value.startsWith('client-');
        const isPersistedId = (value) => isUuid(value) || isNumericString(value) || typeof value === 'number';
        if (contacts) {
            for (const contact of contacts) {
                console.log('Processing contact:', contact);
                const cid = contact.id;
                if (isPersistedId(cid)) {
                    await this.contactsService.updateContact(Number(cid), contact);
                }
                else if (!cid || isClientTempId(cid)) {
                    await this.contactsService.addContact({ ...contact, corporate_id: idNum });
                }
                else {
                    await this.contactsService.updateContact(Number(cid), contact);
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
                await this.contactsService.deleteContact(Number(contactId));
            }
        }
        if (subsidiaries) {
            for (const subsidiary of subsidiaries) {
                const sid = subsidiary.id;
                if (isPersistedId(sid)) {
                    await this.subsidiariesService.updateSubsidiary(Number(sid), subsidiary);
                }
                else if (!sid || isClientTempId(sid)) {
                    await this.subsidiariesService.addSubsidiary({ ...subsidiary, corporate_id: idNum });
                }
                else {
                    await this.subsidiariesService.updateSubsidiary(Number(sid), subsidiary);
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
                await this.subsidiariesService.deleteSubsidiary(Number(subsidiaryId));
            }
        }
        const result = await this.findById(String(id));
        console.log('CorporateService.update returning:', JSON.stringify(result));
        return result;
    }
    async delete(id) {
        const idNum = Number(id);
        await this.db.transaction().execute(async (trx) => {
            await trx.deleteFrom('investigation_logs').where('corporate_id', '=', idNum).execute();
            await trx.deleteFrom('contacts').where('corporate_id', '=', idNum).execute();
            await trx.deleteFrom('subsidiaries').where('corporate_id', '=', idNum).execute();
            await trx.deleteFrom('corporates').where('id', '=', idNum).execute();
        });
        return { success: true };
    }
    async addInvestigationLog(corporateId, logData) {
        console.log('addInvestigationLog called with:', { corporateId, logData });
        try {
            const inserted = await this.db
                .insertInto('investigation_logs')
                .values({
                corporate_id: Number(corporateId),
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
        const idNum = Number(id);
        const corporate = await this.findById(String(id));
        if (!corporate) {
            throw new Error('Corporate not found');
        }
        const oldStatus = corporate.status;
        const shouldLog = !(!note);
        if ((note || status !== oldStatus) && shouldLog) {
            await this.addInvestigationLog(id, {
                timestamp: new Date().toISOString(),
                note: note === undefined ? `Status changed from ${oldStatus} to ${status}` : note,
                from_status: oldStatus,
                to_status: status,
            });
            if (status === 'Rejected') {
                const subject = `Corporate ${status} Notification: ${corporate.company_name}`;
                const html = `
          <p>Dear CRT Member,</p>
          <p>The corporate account for <strong>${corporate.company_name}</strong> (Registration Number: ${corporate.reg_number}) has been ${status.toLowerCase()}.</p>
          <p><strong>Reason:</strong></p>
          <p>${note || 'No specific reason provided.'}</p>
          <p>Please review the corporate details and the provided reason.</p>
          <p>Sincerely,</p>
          <p>The HappyToken Team</p>
        `;
                await this.resendService.sendCustomEmail('wanjun123@1utar.my', subject, html);
            }
            if (status === 'Cooling Period') {
                const coolingPeriodStart = new Date();
                const coolingPeriodEnd = new Date(coolingPeriodStart.getTime() + 30 * 1000);
                await this.db
                    .updateTable('corporates')
                    .set({
                    cooling_period_start: coolingPeriodStart.toISOString(),
                    cooling_period_end: coolingPeriodEnd.toISOString(),
                })
                    .where('id', '=', Number(id))
                    .execute();
                console.log(`[updateStatus] Corporate ${id} entered Cooling Period. Scheduling completion in 30 seconds.`);
                setTimeout(async () => {
                    try {
                        console.log(`[setTimeout] Calling handleCoolingPeriodCompletion for corporate ${id}.`);
                        await this.handleCoolingPeriodCompletion(id);
                        console.log(`[setTimeout] Cooling period completed for corporate ${id}.`);
                    }
                    catch (error) {
                        console.error(`[setTimeout] Error completing cooling period for corporate ${id}:`, error);
                    }
                }, 30000);
            }
        }
        return await this.update(String(id), { status: status });
    }
    async handleCoolingPeriodCompletion(corporateId) {
        console.log(`[handleCoolingPeriodCompletion] called for corporateId: ${corporateId}`);
        const corporate = await this.findById(corporateId);
        if (!corporate) {
            console.error(`[handleCoolingPeriodCompletion] Corporate ${corporateId} not found.`);
            throw new Error('Corporate not found');
        }
        console.log(`[handleCoolingPeriodCompletion] Corporate found: ${JSON.stringify(corporate)}`);
        const hasSuspiciousContact = corporate.contacts.some((contact) => contact.contact_number === '0123456789');
        console.log(`[handleCoolingPeriodCompletion] Has suspicious contact (0123456789): ${hasSuspiciousContact}`);
        let newStatus;
        let note;
        if (hasSuspiciousContact) {
            newStatus = 'Rejected';
            note = `Rejected automatically due to suspicious contact number.`;
            console.log(`[handleCoolingPeriodCompletion] Updating status to: ${newStatus}`);
            await this.updateStatus(corporateId, newStatus, note);
        }
        else {
            newStatus = 'Approved';
            await this.updateStatus(corporateId, newStatus);
        }
        const updatedCorporate = await this.findById(corporateId);
        console.log(`[handleCoolingPeriodCompletion] Status updated successfully for corporate ${corporateId}. New status: ${updatedCorporate?.status}`);
        console.log(`[handleCoolingPeriodCompletion] Returning corporate: ${JSON.stringify(updatedCorporate)}`);
        return updatedCorporate;
    }
    async expireStaleCorporatesDaily() {
        const thirtyDaysAgoIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const stale = await this.db
            .selectFrom('corporates')
            .selectAll()
            .where('updated_at', '<', thirtyDaysAgoIso)
            .where('status', 'in', ['Draft', 'Pending 1st Approval', 'Pending 2nd Approval', 'Cooling Period'])
            .execute();
        for (const corp of stale) {
            await this.updateStatus(String(corp.id), 'Expired', `Auto-expired due to inactivity since ${corp.updated_at}`);
        }
    }
};
exports.CorporateService = CorporateService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_1AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CorporateService.prototype, "expireStaleCorporatesDaily", null);
exports.CorporateService = CorporateService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => resend_service_1.ResendService))),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        contacts_service_1.ContactsService,
        subsidiaries_service_1.SubsidiariesService,
        resend_service_1.ResendService])
], CorporateService);
//# sourceMappingURL=corporate.service.js.map