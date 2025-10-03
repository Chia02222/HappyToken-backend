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
        const corporate = await this.db
            .selectFrom('corporates')
            .selectAll()
            .where('uuid', '=', id)
            .executeTakeFirst();
        if (!corporate) {
            return null;
        }
        const [contacts, subsidiaries, investigationLogs] = await Promise.all([
            this.db.selectFrom('contacts').selectAll().where('corporate_uuid', '=', corporate.uuid).orderBy('created_at', 'asc').execute(),
            this.db.selectFrom('subsidiaries').selectAll().where('corporate_uuid', '=', corporate.uuid).execute(),
            this.db.selectFrom('investigation_logs').selectAll().where('corporate_uuid', '=', corporate.uuid).orderBy('timestamp', 'desc').execute(),
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
            pinned: false,
            created_at: (0, kysely_1.sql) `date_trunc('second', now() AT TIME ZONE 'Asia/Kuala_Lumpur')::timestamp(0)`,
            updated_at: (0, kysely_1.sql) `date_trunc('second', now() AT TIME ZONE 'Asia/Kuala_Lumpur')::timestamp(0)`,
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
                await this.contactsService.addContact({ ...contact, corporate_uuid: inserted.uuid });
            }
        }
        if (subsidiaries) {
            for (const subsidiary of subsidiaries) {
                await this.subsidiariesService.addSubsidiary({ ...subsidiary, corporate_uuid: inserted.uuid });
            }
        }
        if (secondary_approver) {
            let secondaryApproverUuid;
            if (secondary_approver.use_existing_contact && secondary_approver.selected_contact_id) {
                const selectedUuid = String(secondary_approver.selected_contact_id);
                await this.contactsService.updateContact(selectedUuid, {
                    salutation: secondary_approver.salutation ?? '',
                    first_name: secondary_approver.first_name ?? '',
                    last_name: secondary_approver.last_name ?? '',
                    company_role: secondary_approver.company_role ?? '',
                    system_role: secondary_approver.system_role ?? '',
                    email: secondary_approver.email ?? '',
                    contact_number: secondary_approver.contact_number ?? '',
                });
                secondaryApproverUuid = selectedUuid;
            }
            else if (!secondary_approver.use_existing_contact) {
                const insertedContact = await this.contactsService.addContact({
                    corporate_uuid: inserted.uuid,
                    salutation: secondary_approver.salutation ?? '',
                    first_name: secondary_approver.first_name ?? '',
                    last_name: secondary_approver.last_name ?? '',
                    company_role: secondary_approver.company_role ?? '',
                    system_role: secondary_approver.system_role ?? '',
                    email: secondary_approver.email ?? '',
                    contact_number: secondary_approver.contact_number ?? '',
                });
                secondaryApproverUuid = insertedContact.uuid;
            }
            if (secondaryApproverUuid !== undefined) {
                await this.db
                    .updateTable('corporates')
                    .set({
                    secondary_approver_uuid: secondaryApproverUuid,
                    updated_at: (0, kysely_1.sql) `date_trunc('second', now() AT TIME ZONE 'Asia/Kuala_Lumpur')::timestamp(0)`,
                })
                    .where('uuid', '=', inserted.uuid)
                    .execute();
            }
        }
        return inserted;
    }
    async update(id, updateData) {
        try {
        }
        catch { }
        const { investigation_log: _investigation_log, ...restOfUpdateData } = updateData;
        const { id: _updateDtoId, contacts, subsidiaries, contactIdsToDelete, subsidiaryIdsToDelete, secondary_approver: _secondary_approver, ...corporateUpdateData } = restOfUpdateData;
        const looksUuid = true;
        const secondaryApproverData = updateData.secondary_approver;
        if (secondaryApproverData) {
            let secondaryApproverUuid;
            const existingSecondaryContact = contacts?.find(contact => contact.system_role === 'secondary_approver' ||
                (secondaryApproverData.selected_contact_id && String(contact.id) === String(secondaryApproverData.selected_contact_id)));
            if (existingSecondaryContact) {
                secondaryApproverUuid = String(existingSecondaryContact.id);
            }
            else if (secondaryApproverData.use_existing_contact && secondaryApproverData.selected_contact_id) {
                const selectedUuid = String(secondaryApproverData.selected_contact_id);
                await this.contactsService.updateContact(selectedUuid, {
                    salutation: secondaryApproverData.salutation ?? '',
                    first_name: secondaryApproverData.first_name ?? '',
                    last_name: secondaryApproverData.last_name ?? '',
                    company_role: secondaryApproverData.company_role ?? '',
                    system_role: secondaryApproverData.system_role ?? '',
                    email: secondaryApproverData.email ?? '',
                    contact_number: secondaryApproverData.contact_number ?? '',
                });
                secondaryApproverUuid = selectedUuid;
            }
            else if (!secondaryApproverData.use_existing_contact) {
                const insertedContact = await this.contactsService.addContact({
                    corporate_uuid: id,
                    salutation: secondaryApproverData.salutation ?? '',
                    first_name: secondaryApproverData.first_name ?? '',
                    last_name: secondaryApproverData.last_name ?? '',
                    company_role: secondaryApproverData.company_role ?? '',
                    system_role: secondaryApproverData.system_role ?? '',
                    email: secondaryApproverData.email ?? '',
                    contact_number: secondaryApproverData.contact_number ?? '',
                });
                secondaryApproverUuid = insertedContact.uuid;
            }
            if (secondaryApproverUuid !== undefined) {
                await this.db
                    .updateTable('corporates')
                    .set({
                    secondary_approver_uuid: secondaryApproverUuid,
                    updated_at: (0, kysely_1.sql) `date_trunc('second', now() AT TIME ZONE 'Asia/Kuala_Lumpur')::timestamp(0)`,
                })
                    .where('uuid', '=', id)
                    .execute();
            }
        }
        const { secondary_approver_id: _legacySecondaryId, uuid: _uuidIgnore, created_at: _createdAtIgnore, updated_at: _updatedAtIgnore, ...sanitizedCorporateUpdate } = corporateUpdateData;
        const corporateFieldsToUpdate = {
            ...sanitizedCorporateUpdate,
            agreement_from: corporateUpdateData.agreement_from === '' ? null : corporateUpdateData.agreement_from,
            agreement_to: corporateUpdateData.agreement_to === '' ? null : corporateUpdateData.agreement_to,
            website: corporateUpdateData.website === '' || corporateUpdateData.website === null || corporateUpdateData.website === undefined ? 'N/A' : corporateUpdateData.website,
            updated_at: (0, kysely_1.sql) `date_trunc('second', now() AT TIME ZONE 'Asia/Kuala_Lumpur')::timestamp(0)`,
        };
        const updatedCorporate = await this.db
            .updateTable('corporates')
            .set(corporateFieldsToUpdate)
            .where('uuid', '=', id)
            .returningAll()
            .executeTakeFirst();
        if (!updatedCorporate) {
            return null;
        }
        const isUuid = (value) => typeof value === 'string' && /^[0-9a-fA-F-]{36}$/.test(value);
        const isClientTempId = (value) => typeof value === 'string' && value.startsWith('client-');
        const isPersistedId = (value) => isUuid(value);
        if (contacts) {
            for (const contact of contacts) {
                const cid = contact.id;
                if (isPersistedId(cid)) {
                    await this.contactsService.updateContact(String(cid), contact);
                }
                else if (!cid || isClientTempId(cid)) {
                    await this.contactsService.addContact({ ...contact, corporate_uuid: id });
                }
                else {
                    await this.contactsService.updateContact(String(cid), contact);
                }
            }
        }
        if (contactIdsToDelete) {
            for (const contactId of contactIdsToDelete) {
                if (!contactId) {
                    console.warn('Skipping empty contactId');
                    continue;
                }
                await this.contactsService.deleteContact(String(contactId));
            }
        }
        if (subsidiaries) {
            for (const subsidiary of subsidiaries) {
                const sid = subsidiary.id;
                if (isPersistedId(sid)) {
                    await this.subsidiariesService.updateSubsidiary(String(sid), subsidiary);
                }
                else if (!sid || isClientTempId(sid)) {
                    await this.subsidiariesService.addSubsidiary({ ...subsidiary, corporate_uuid: id });
                }
                else {
                    await this.subsidiariesService.updateSubsidiary(String(sid), subsidiary);
                }
            }
        }
        if (subsidiaryIdsToDelete) {
            for (const subsidiaryId of subsidiaryIdsToDelete) {
                if (!subsidiaryId) {
                    console.warn('Skipping empty subsidiaryId');
                    continue;
                }
                await this.subsidiariesService.deleteSubsidiary(String(subsidiaryId));
            }
        }
        const result = await this.findById(id);
        return result;
    }
    async delete(id) {
        await this.db.transaction().execute(async (trx) => {
            await trx.deleteFrom('investigation_logs').where('corporate_uuid', '=', id).execute();
            await trx.deleteFrom('contacts').where('corporate_uuid', '=', id).execute();
            await trx.deleteFrom('subsidiaries').where('corporate_uuid', '=', id).execute();
            await trx.deleteFrom('corporates').where('uuid', '=', id).execute();
        });
        return { success: true };
    }
    async addInvestigationLog(corporateId, logData) {
        try {
            let inserted = null;
            try {
                inserted = await this.db
                    .insertInto('investigation_logs')
                    .values({
                    corporate_uuid: corporateId,
                    timestamp: logData.timestamp,
                    note: logData.note ?? null,
                    from_status: logData.from_status ?? null,
                    to_status: logData.to_status ?? null,
                    amendment_data: logData.amendment_data ?? null,
                    created_at: (0, kysely_1.sql) `date_trunc('second', now() AT TIME ZONE 'Asia/Kuala_Lumpur')::timestamp(0)`,
                })
                    .returningAll()
                    .executeTakeFirst();
            }
            catch { }
            return inserted;
        }
        catch (error) {
            console.error('Error inserting investigation log:', error);
            throw error;
        }
    }
    async getInvestigationLogs(corporateId) {
        try {
            const logs = await this.db
                .selectFrom('investigation_logs')
                .selectAll()
                .where('corporate_uuid', '=', corporateId)
                .orderBy('created_at', 'desc')
                .execute();
            return logs;
        }
        catch (error) {
            console.error('Error fetching investigation logs:', error);
            throw error;
        }
    }
    async updateStatus(id, status, note) {
        const corporate = await this.findById(id);
        if (!corporate) {
            throw new Error('Corporate not found');
        }
        const oldStatus = corporate.status;
        const hasStatusChange = status !== oldStatus;
        const hasNote = note !== undefined && String(note).trim() !== '';
        if (hasStatusChange || hasNote) {
            await this.addInvestigationLog(id, {
                timestamp: (0, kysely_1.sql) `(now() AT TIME ZONE 'Asia/Kuala_Lumpur')::text`,
                note: hasNote ? note : `Status changed from ${oldStatus} to ${status}`,
                from_status: oldStatus,
                to_status: status,
                amendment_data: null,
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
        }
        if (status === 'Cooling Period') {
            const coolingPeriodStart = new Date();
            const coolingPeriodEnd = new Date(coolingPeriodStart.getTime() + 30 * 1000);
            try {
                await this.db
                    .updateTable('corporates')
                    .set({
                    cooling_period_start: (0, kysely_1.sql) `(${coolingPeriodStart} AT TIME ZONE 'Asia/Kuala_Lumpur')::text`,
                    cooling_period_end: (0, kysely_1.sql) `(${coolingPeriodEnd} AT TIME ZONE 'Asia/Kuala_Lumpur')::text`,
                })
                    .where('uuid', '=', id)
                    .execute();
            }
            catch { }
            setTimeout(async () => {
                try {
                    await this.handleCoolingPeriodCompletion(id);
                }
                catch (error) {
                    console.error(`[setTimeout] Error completing cooling period for corporate ${id}:`, error);
                }
            }, 30000);
        }
        return await this.update(String(id), { status: status });
    }
    async handleCoolingPeriodCompletion(corporateId) {
        const corporate = await this.findById(corporateId);
        if (!corporate) {
            console.error(`[handleCoolingPeriodCompletion] Corporate ${corporateId} not found.`);
            throw new Error('Corporate not found');
        }
        const newStatus = 'Approved';
        const note = `Cooling period completed. Auto-approved by system after 30 seconds.`;
        await this.updateStatus(corporateId, newStatus, note);
        const updatedCorporate = await this.findById(corporateId);
        try {
            await this.resendService.sendAccountCreatedSuccessEmail(corporateId);
        }
        catch (error) {
            console.error(`[handleCoolingPeriodCompletion] Failed to send welcome email for corporate ${corporateId}:`, error);
        }
        return updatedCorporate;
    }
    async expireStaleCorporatesDaily() {
        const thirtyDaysAgoIso = (0, kysely_1.sql) `(now() - interval '30 days' AT TIME ZONE 'Asia/Kuala_Lumpur')::text`;
        const stale = await this.db
            .selectFrom('corporates')
            .selectAll()
            .where('updated_at', '<', thirtyDaysAgoIso)
            .where('status', 'in', ['Draft', 'Pending 1st Approval', 'Pending 2nd Approval', 'Cooling Period'])
            .execute();
        for (const corp of stale) {
            await this.updateStatus(String(corp.uuid ?? corp.id), 'Expired', `Auto-expired due to inactivity since ${corp.updated_at}`);
        }
    }
    async createAmendmentRequest(corporateId, amendmentData) {
        try {
            const corporate = await this.findById(corporateId);
            if (!corporate) {
                throw new Error('Corporate not found');
            }
            const amended = amendmentData.amendedData || {};
            const changed_fields = {};
            for (const key of Object.keys(amended)) {
                const newVal = amended[key];
                const oldVal = corporate[key];
                if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
                    changed_fields[key] = newVal;
                }
            }
            let submittedBy = 'Unknown Approver';
            const amendedContacts = amended.contacts || [];
            if (amendedContacts.length > 0) {
                let approverContact = null;
                if (corporate.status === 'Pending 2nd Approval') {
                    const secondaryApprover = amendedContacts.find((c) => c.system_role === 'secondary_approver');
                    if (secondaryApprover) {
                        approverContact = secondaryApprover;
                    }
                    else {
                        approverContact = amendedContacts[0];
                    }
                }
                else {
                    approverContact = amendedContacts[0];
                }
                if (approverContact && approverContact.first_name && approverContact.last_name) {
                    const fullName = `${approverContact.first_name} ${approverContact.last_name}`.trim();
                    const role = approverContact.company_role || (approverContact.system_role === 'secondary_approver' ? 'Secondary Approver' : 'First Approver');
                    submittedBy = `${fullName} (${role})`;
                }
            }
            const amendmentNote = `Amendment request submitted by ${submittedBy}`;
            const inserted = await this.addInvestigationLog(corporateId, {
                timestamp: (0, kysely_1.sql) `(now() AT TIME ZONE 'Asia/Kuala_Lumpur')::text`,
                note: amendmentNote,
                from_status: corporate.status,
                to_status: 'Amendment Requested',
                amendment_data: {
                    requested_changes: amendmentData.requestedChanges,
                    submitted_by: amendmentData.submittedBy,
                    changed_fields,
                    original_data: corporate,
                    amended_data: amended,
                    status: 'pending'
                }
            });
            await this.db
                .updateTable('corporates')
                .set({ status: 'Amendment Requested' })
                .where('uuid', '=', corporateId)
                .execute();
            const amendmentId = inserted.uuid ?? inserted.id;
            return { success: true, message: 'Amendment request created successfully', amendmentId };
        }
        catch (error) {
            console.error('Error creating amendment request:', error);
            throw error;
        }
    }
    async updateAmendmentStatus(corporateId, amendmentId, status, reviewNotes) {
        try {
            const amendmentLog = await this.db
                .selectFrom('investigation_logs')
                .selectAll()
                .where('uuid', '=', amendmentId)
                .where('corporate_uuid', '=', corporateId)
                .where('to_status', '=', 'Amendment Requested')
                .executeTakeFirst();
            if (!amendmentLog) {
                throw new Error('Amendment request not found');
            }
            const statusNote = status === 'approved'
                ? `Amendment approved by CRT Team`
                : `Amendment declined by CRT Team (Reason: ${reviewNotes || 'Rejected'})`;
            await this.addInvestigationLog(corporateId, {
                timestamp: (0, kysely_1.sql) `(now() AT TIME ZONE 'Asia/Kuala_Lumpur')::text`,
                note: statusNote,
                from_status: 'Amendment Requested',
                to_status: amendmentLog.from_status || 'Pending 1st Approval',
                amendment_data: {
                    ...amendmentLog.amendment_data,
                    status: status,
                    review_notes: reviewNotes,
                    decision: status
                }
            });
            const previousStatus = amendmentLog.from_status || 'Pending 1st Approval';
            await this.db
                .updateTable('corporates')
                .set({ status: previousStatus })
                .where('uuid', '=', corporateId)
                .execute();
            const changes = amendmentLog.amendment_data?.changed_fields || amendmentLog.amendment_data?.amended_data;
            if (status === 'approved' && changes) {
                await this.update(corporateId, changes);
            }
            return { success: true, message: `Amendment ${status} successfully` };
        }
        catch (error) {
            console.error('Error updating amendment status:', error);
            throw error;
        }
    }
    async getAmendmentRequests(corporateId) {
        try {
            let query = this.db
                .selectFrom('investigation_logs')
                .selectAll()
                .where('to_status', '=', 'Amendment Requested')
                .orderBy('created_at', 'desc');
            if (corporateId) {
                query = query.where('corporate_uuid', '=', corporateId);
            }
            const amendmentRequests = await query.execute();
            return amendmentRequests;
        }
        catch (error) {
            console.error('Error fetching amendment requests:', error);
            throw error;
        }
    }
    async getAmendmentById(amendmentId) {
        try {
            const amendment = await this.db
                .selectFrom('investigation_logs')
                .selectAll()
                .where('uuid', '=', amendmentId)
                .where('to_status', '=', 'Amendment Requested')
                .executeTakeFirst();
            return amendment;
        }
        catch (error) {
            console.error('Error fetching amendment by ID:', error);
            throw error;
        }
    }
    async updatePinnedStatus(corporateId, pinned) {
        try {
            await this.db
                .updateTable('corporates')
                .set({ pinned })
                .where('uuid', '=', corporateId)
                .execute();
            return { success: true, message: `Corporate ${pinned ? 'pinned' : 'unpinned'} successfully` };
        }
        catch (error) {
            console.error('Error updating pinned status:', error);
            throw error;
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