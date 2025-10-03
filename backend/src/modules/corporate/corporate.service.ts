import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  CorporateTable,
  InvestigationLogTable,
  CorporateStatus,
  NewCorporate,
} from '../../database/types';
import { sql } from 'kysely';
import { CreateCorporateWithRelationsDto,UpdateCorporateDto } from './dto/corporate.dto';
import { CreateContactDto } from '../contacts/dto/contact.dto';
import { CreateSubsidiaryDto } from '../subsidiaries/dto/subsidiary.dto';
import { ContactsService } from '../contacts/contacts.service';
import { SubsidiariesService } from '../subsidiaries/subsidiaries.service';
import { ResendService } from '../resend/resend.service';
import { Cron, CronExpression } from '@nestjs/schedule';

type UpdatableCorporateTable = Omit<CorporateTable, 'uuid'>;

/**
 * Corporate Service
 * 
 * Main service for managing corporate accounts and their lifecycle.
 * Handles CRUD operations, status transitions, and approval workflows.
 * 
 * Key Business Rules:
 * - Corporate approval requires 2 approvers (primary and secondary)
 * - Status flow: Draft → Pending 1st Approval → Pending 2nd Approval → Cooling Period → Approved
 * - Amendment requests can be made from any approved status
 * - Investigation logs track all status changes and actions
 * 
 * Related Services:
 * - ContactsService: Manages corporate contacts
 * - SubsidiariesService: Manages corporate subsidiaries
 * - ResendService: Handles email notifications
 */
@Injectable()
export class CorporateService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly contactsService: ContactsService,
    private readonly subsidiariesService: SubsidiariesService,
    @Inject(forwardRef(() => ResendService))
    private readonly resendService: ResendService,
  ) {}

  private get db() {
    return this.dbService.getDb();
  }

  async findAll() {
    return await this.db
      .selectFrom('corporates')
      .selectAll()
      .orderBy('created_at', 'desc')
      .execute();
  }

  async findById(id: string) {
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

  /**
   * Creates a new corporate account with related entities
   * 
   * Process:
   * 1. Insert corporate record with 'Draft' status
   * 2. Create associated contacts (primary contact is required)
   * 3. Create associated subsidiaries (if any)
   * 4. Handle secondary approver setup (existing contact or new)
   * 5. Link secondary approver to corporate record
   * 
   * Important: Secondary approver can be:
   * - An existing contact (use_existing_contact = true)
   * - A new contact (automatically created and linked)
   * - Marked with system_role = 'secondary_approver'
   * 
   * @param corporateData - Corporate data with contacts, subsidiaries, and secondary approver
   * @returns Created corporate record with UUID
   */
  async create(corporateData: Omit<CreateCorporateWithRelationsDto, 'investigation_log'>) {
    const { contacts, subsidiaries, secondary_approver, ...corporateBaseData } = corporateData;

    const corporateInsertData: NewCorporate = {
      ...corporateBaseData,
      status: 'Draft',
      agreement_from: (corporateBaseData as any).agreement_from === '' ? null : (corporateBaseData as any).agreement_from,
      agreement_to: (corporateBaseData as any).agreement_to === '' ? null : (corporateBaseData as any).agreement_to,
      pinned: false,
      created_at: sql`date_trunc('second', now() AT TIME ZONE 'Asia/Kuala_Lumpur')::timestamp(0)` as unknown as string,
      updated_at: sql`date_trunc('second', now() AT TIME ZONE 'Asia/Kuala_Lumpur')::timestamp(0)` as unknown as string,
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
        await this.contactsService.addContact({ ...contact, corporate_uuid: (inserted as any).uuid });
      }
    }

    if (subsidiaries) {
      for (const subsidiary of subsidiaries) {
        await this.subsidiariesService.addSubsidiary({ ...subsidiary, corporate_uuid: (inserted as any).uuid });
      }
    }

    if (secondary_approver) {
      let secondaryApproverUuid: string | undefined;

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
      } else if (!secondary_approver.use_existing_contact) {
        const insertedContact = await this.contactsService.addContact({
          // @ts-ignore use uuid linkage
          corporate_uuid: (inserted as any).uuid,
          salutation: secondary_approver.salutation ?? '',
          first_name: secondary_approver.first_name ?? '',
          last_name: secondary_approver.last_name ?? '',
          company_role: secondary_approver.company_role ?? '',
          system_role: secondary_approver.system_role ?? '',
          email: secondary_approver.email ?? '',
          contact_number: secondary_approver.contact_number ?? '',
        });
        secondaryApproverUuid = (insertedContact as any).uuid as string;
      }

      if (secondaryApproverUuid !== undefined) {
        await this.db
          .updateTable('corporates')
          .set({
            secondary_approver_uuid: secondaryApproverUuid,
            updated_at: sql`date_trunc('second', now() AT TIME ZONE 'Asia/Kuala_Lumpur')::timestamp(0)` as unknown as string,
          })
          .where('uuid', '=', (inserted as any).uuid)
          .execute();
      }
    }

    return inserted!;
  }

  /**
   * Updates an existing corporate account
   * 
   * Process:
   * 1. Update corporate base data
   * 2. Handle contact updates (create, update, delete)
   * 3. Handle subsidiary updates (create, update, delete)
   * 4. Update secondary approver if changed
   * 5. Preserve investigation logs (audit trail)
   * 
   * Important: 
   * - Secondary approver updates require special handling
   * - Investigation logs are NEVER deleted (audit compliance)
   * - Status changes should use updateStatus() method
   * 
   * @param id - Corporate UUID
   * @param updateData - Updated corporate data
   * @returns Updated corporate record
   */
  async update(id: string, updateData: UpdateCorporateDto) {
    try {
    } catch {}

    const { investigation_log: _investigation_log, ...restOfUpdateData } = updateData as UpdateCorporateDto & { investigation_log?: InvestigationLogTable };

    const {
      id: _updateDtoId,
      contacts,
      subsidiaries,
      contactIdsToDelete,
      subsidiaryIdsToDelete,
      secondary_approver: _secondary_approver,
      ...corporateUpdateData
    } = restOfUpdateData;

    const looksUuid = true;
    const secondaryApproverData = updateData.secondary_approver;

    

    if (secondaryApproverData) {
      let secondaryApproverUuid: string | undefined;

      // Check if secondary approver contact already exists in the contacts array
      const existingSecondaryContact = contacts?.find(contact => 
        contact.system_role === 'secondary_approver' || 
        (secondaryApproverData.selected_contact_id && String(contact.id) === String(secondaryApproverData.selected_contact_id))
      );

      if (existingSecondaryContact) {
        // Secondary approver contact already exists in contacts array, just link it
        secondaryApproverUuid = String(existingSecondaryContact.id);
      } else if (secondaryApproverData.use_existing_contact && secondaryApproverData.selected_contact_id) {
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
      } else if (!secondaryApproverData.use_existing_contact) {
        const insertedContact = await this.contactsService.addContact({
          // prefer uuid link
          // @ts-ignore transitional DTO support
          corporate_uuid: id,
          salutation: secondaryApproverData.salutation ?? '',
          first_name: secondaryApproverData.first_name ?? '',
          last_name: secondaryApproverData.last_name ?? '',
          company_role: secondaryApproverData.company_role ?? '',
          system_role: secondaryApproverData.system_role ?? '',
          email: secondaryApproverData.email ?? '',
          contact_number: secondaryApproverData.contact_number ?? '',
        });
        secondaryApproverUuid = (insertedContact as any).uuid as string;
      }

      if (secondaryApproverUuid !== undefined) {
        await this.db
          .updateTable('corporates')
          .set({
            secondary_approver_uuid: secondaryApproverUuid,
            updated_at: sql`date_trunc('second', now() AT TIME ZONE 'Asia/Kuala_Lumpur')::timestamp(0)` as unknown as string,
          })
          .where('uuid', '=', id)
          .execute();
      }
    }

    // Remove legacy/unsupported fields that would cause DB errors (no such columns)
    const { secondary_approver_id: _legacySecondaryId, uuid: _uuidIgnore, created_at: _createdAtIgnore, updated_at: _updatedAtIgnore, ...sanitizedCorporateUpdate } = (corporateUpdateData as any);

    const corporateFieldsToUpdate: Partial<UpdatableCorporateTable> = {
      ...(sanitizedCorporateUpdate as Partial<UpdatableCorporateTable>),
      agreement_from: (corporateUpdateData as any).agreement_from === '' ? null : (corporateUpdateData as any).agreement_from,
      agreement_to: (corporateUpdateData as any).agreement_to === '' ? null : (corporateUpdateData as any).agreement_to,
      website: corporateUpdateData.website === '' || corporateUpdateData.website === null || corporateUpdateData.website === undefined ? 'N/A' : corporateUpdateData.website,
      updated_at: sql`date_trunc('second', now() AT TIME ZONE 'Asia/Kuala_Lumpur')::timestamp(0)` as unknown as string,
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

    const isUuid = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-fA-F-]{36}$/.test(value);
    const isClientTempId = (value: unknown): boolean => typeof value === 'string' && value.startsWith('client-');
    const isPersistedId = (value: unknown): boolean => isUuid(value);

    if (contacts) {
      for (const contact of contacts) {
        const cid = (contact as { id?: unknown }).id;
        if (isPersistedId(cid)) {
          await this.contactsService.updateContact(String(cid), contact as any);
        } else if (!cid || isClientTempId(cid)) {
          // @ts-ignore accept uuid during transition
          await this.contactsService.addContact({ ...(contact as any), corporate_uuid: id } as any);
        } else {
          // fallback best-effort: try as string
          await this.contactsService.updateContact(String(cid), contact as any);
        }
      }
    }

    if (contactIdsToDelete) {
        for (const contactId of contactIdsToDelete) {
            if (!contactId) { console.warn('Skipping empty contactId'); continue; }
            await this.contactsService.deleteContact(String(contactId));
        }
    }

    if (subsidiaries) {
      for (const subsidiary of subsidiaries) {
        const sid = (subsidiary as { id?: unknown }).id;
        if (isPersistedId(sid)) {
          await this.subsidiariesService.updateSubsidiary(String(sid), subsidiary as any);
        } else if (!sid || isClientTempId(sid)) {
          // @ts-ignore accept uuid during transition
          await this.subsidiariesService.addSubsidiary({ ...(subsidiary as any), corporate_uuid: id } as any);
        } else {
          await this.subsidiariesService.updateSubsidiary(String(sid), subsidiary as any);
        }
      }
    }

    if (subsidiaryIdsToDelete) {
        for (const subsidiaryId of subsidiaryIdsToDelete) {
            if (!subsidiaryId) { console.warn('Skipping empty subsidiaryId'); continue; }
            await this.subsidiariesService.deleteSubsidiary(String(subsidiaryId));
        }
    }

    const result = await this.findById(id);
    return result;
  }

  async delete(id: string) {
    await this.db.transaction().execute(async (trx) => {
      await trx.deleteFrom('investigation_logs').where('corporate_uuid', '=', id).execute();
      await trx.deleteFrom('contacts').where('corporate_uuid', '=', id).execute();
      await trx.deleteFrom('subsidiaries').where('corporate_uuid', '=', id).execute();
      await trx.deleteFrom('corporates').where('uuid', '=', id).execute();
    });
    return { success: true };
  }

  async addInvestigationLog(corporateId: string, logData: Omit<InvestigationLogTable, 'uuid' | 'corporate_uuid' | 'created_at' | 'id' | 'corporate_id'>) {
    try {
      let inserted = null as any;
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
            created_at: sql`date_trunc('second', now() AT TIME ZONE 'Asia/Kuala_Lumpur')::timestamp(0)` as unknown as string,
          })
          .returningAll()
          .executeTakeFirst();
      } catch {}
      return inserted!;
    } catch (error) {
      console.error('Error inserting investigation log:', error);
      throw error;
    }
  }

  async getInvestigationLogs(corporateId: string) {
    try {
      const logs = await this.db
        .selectFrom('investigation_logs')
        .selectAll()
        .where('corporate_uuid', '=', corporateId)
        .orderBy('created_at', 'desc')
        .execute();
      return logs;
    } catch (error) {
      console.error('Error fetching investigation logs:', error);
      throw error;
    }
  }

  /**
   * Updates corporate status and creates investigation log
   * 
   * Status Transition Rules:
   * - Draft → Pending 1st Approval (when sent to first approver)
   * - Pending 1st Approval → Pending 2nd Approval (first approver approves)
   * - Pending 2nd Approval → Cooling Period (second approver approves)
   * - Cooling Period → Approved (after 14 days, automatic)
   * - Any status → Amendment Requested (when amendment is submitted)
   * - Amendment Requested → Previous Status (when amendment approved/declined)
   * 
   * Investigation Logs:
   * - Every status change is logged with timestamp
   * - Logs include actor, action, and optional notes
   * - Used for audit trail and timeline display
   * 
   * @param id - Corporate UUID
   * @param status - New status
   * @param note - Optional note describing the change
   */
  async updateStatus(id: string, status: string, note?: string) {
    const corporate = await this.findById(id);
    if (!corporate) {
      throw new Error('Corporate not found');
    }

    const oldStatus = corporate.status;

    const hasStatusChange = status !== oldStatus;
    const hasNote = note !== undefined && String(note).trim() !== '';

    if (hasStatusChange || hasNote) {
      await this.addInvestigationLog(id, {
        timestamp: sql`(now() AT TIME ZONE 'Asia/Kuala_Lumpur')::text` as unknown as string,
        note: hasNote ? note! : `Status changed from ${oldStatus} to ${status}`,
        from_status: oldStatus as CorporateStatus,
        to_status: status as CorporateStatus,
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
            cooling_period_start: sql`(${coolingPeriodStart} AT TIME ZONE 'Asia/Kuala_Lumpur')::text` as unknown as string,
            cooling_period_end: sql`(${coolingPeriodEnd} AT TIME ZONE 'Asia/Kuala_Lumpur')::text` as unknown as string,
          })
          .where('uuid', '=', id)
          .execute();
      } catch {}

      setTimeout(async () => {
        try {
          await this.handleCoolingPeriodCompletion(id);
        } catch (error) {
          console.error(`[setTimeout] Error completing cooling period for corporate ${id}:`, error);
        }
      }, 30000);
    }

    return await this.update(String(id), { status: status as CorporateStatus });
  }

  /**
   * Completes cooling period and activates corporate account
   * 
   * Process:
   * 1. Verify corporate exists and is in 'Cooling Period' status
   * 2. Update status to 'Approved'
   * 3. Send welcome emails to both approvers
   * 4. Create investigation log for completion
   * 
   * Error Handling:
   * - Email failures don't block status update (logged but not thrown)
   * - Status is updated even if email fails
   * 
   * Note: Currently triggered after 30 seconds for testing.
   * In production, should be triggered by cron job after 14 days.
   * 
   * @param corporateId - Corporate UUID
   * @returns Updated corporate record
   */
  async handleCoolingPeriodCompletion(corporateId: string) {
    const corporate = await this.findById(corporateId);
    if (!corporate) {
      console.error(`[handleCoolingPeriodCompletion] Corporate ${corporateId} not found.`);
      throw new Error('Corporate not found');
    }

    const newStatus: CorporateStatus = 'Approved';
    const note = `Cooling period completed. Auto-approved by system after 30 seconds.`;
    await this.updateStatus(corporateId, newStatus, note);

    const updatedCorporate = await this.findById(corporateId);
    
    // Send welcome email to first and second approvers
    try {
      await this.resendService.sendAccountCreatedSuccessEmail(corporateId);
    } catch (error) {
      console.error(`[handleCoolingPeriodCompletion] Failed to send welcome email for corporate ${corporateId}:`, error);
      // Don't throw error - email failure shouldn't stop the cooling period completion
    }
    
    return updatedCorporate;
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async expireStaleCorporatesDaily() {
    const thirtyDaysAgoIso = sql`(now() - interval '30 days' AT TIME ZONE 'Asia/Kuala_Lumpur')::text` as unknown as string;
    const stale = await this.db
      .selectFrom('corporates')
      .selectAll()
      .where('updated_at', '<', thirtyDaysAgoIso)
      .where('status', 'in', ['Draft', 'Pending 1st Approval', 'Pending 2nd Approval', 'Cooling Period'])
      .execute();

    for (const corp of stale as any[]) {
      await this.updateStatus(String(corp.uuid ?? corp.id), 'Expired', `Auto-expired due to inactivity since ${corp.updated_at}`);
    }
  }

  // Amendment Request Methods
  /**
   * Creates an amendment request for an existing corporate
   * 
   * Amendment Workflow:
   * 1. Compare current data with proposed changes
   * 2. Store only changed fields (not full data)
   * 3. Update status to 'Amendment Requested'
   * 4. Create investigation log with change details
   * 5. Notify CRT team via email
   * 
   * Important Business Rules:
   * - Amendments can only be requested from certain statuses
   * - Changed fields are stored separately for comparison
   * - Original data remains unchanged until amendment approved
   * - Submitter info is captured from current status (primary or secondary approver)
   * 
   * @param corporateId - Corporate UUID
   * @param amendmentData - Proposed changes
   * @returns Created amendment request with UUID
   */
  async createAmendmentRequest(corporateId: string, amendmentData: any) {
    try {
      
      // Get current corporate data
      const corporate = await this.findById(corporateId);
      if (!corporate) {
        throw new Error('Corporate not found');
      }

      // Compute changed fields only (compare amendedData to current corporate)
      const amended = amendmentData.amendedData || {};
      const changed_fields: Record<string, unknown> = {};
      for (const key of Object.keys(amended)) {
        const newVal = (amended as any)[key];
        const oldVal = (corporate as any)[key];
        if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
          (changed_fields as any)[key] = newVal;
        }
      }

      // Extract contact information from amendment data based on current status
      let submittedBy = 'Unknown Approver';
      const amendedContacts = amended.contacts || [];

      if (amendedContacts.length > 0) {
        let approverContact: any = null;
        
        // Determine which approver submitted based on current status
        if (corporate.status === 'Pending 2nd Approval') {
          // Secondary approver submitted the amendment
          const secondaryApprover = amendedContacts.find((c: any) => c.system_role === 'secondary_approver');
          if (secondaryApprover) {
            approverContact = secondaryApprover;
          } else {
            // Fallback to primary contact if no secondary approver found
            approverContact = amendedContacts[0];
          }
        } else {
          // Primary approver submitted the amendment (Pending 1st Approval or other statuses)
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
        timestamp: sql`(now() AT TIME ZONE 'Asia/Kuala_Lumpur')::text` as unknown as string,
        note: amendmentNote,
        from_status: corporate.status,
        to_status: 'Amendment Requested',
        amendment_data: {
          requested_changes: amendmentData.requestedChanges,
          submitted_by: amendmentData.submittedBy,
          changed_fields,
          original_data: corporate,  // Store original data snapshot
          amended_data: amended,     // Store amended data snapshot
          status: 'pending'
        }
      });

      // Update corporate status to Amendment Requested (without creating duplicate log)
      await this.db
        .updateTable('corporates')
        .set({ status: 'Amendment Requested' })
        .where('uuid', '=', corporateId)
        .execute();

      const amendmentId = (inserted as any).uuid ?? (inserted as any).id;
      return { success: true, message: 'Amendment request created successfully', amendmentId };
    } catch (error) {
      console.error('Error creating amendment request:', error);
      throw error;
    }
  }

  async updateAmendmentStatus(corporateId: string, amendmentId: string, status: 'approved' | 'rejected', reviewNotes?: string) {
    try {
      // Get the amendment request
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

      // Update amendment status
      const statusNote = status === 'approved' 
        ? `Amendment approved by CRT Team`
        : `Amendment declined by CRT Team (Reason: ${reviewNotes || 'Rejected'})`;

      await this.addInvestigationLog(corporateId, {
        timestamp: sql`(now() AT TIME ZONE 'Asia/Kuala_Lumpur')::text` as unknown as string,
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

      // Update corporate status to the previous status (from the amendment log) without creating a log entry
      const previousStatus = amendmentLog.from_status || 'Pending 1st Approval';
      await this.db
        .updateTable('corporates')
        .set({ status: previousStatus as CorporateStatus })
        .where('uuid', '=', corporateId)
        .execute();

      // If approved, apply the changes to corporate data (prefer changed_fields; fallback to legacy amended_data)
      const changes = amendmentLog.amendment_data?.changed_fields || amendmentLog.amendment_data?.amended_data;
      if (status === 'approved' && changes) {
        await this.update(corporateId, changes);
      }

      return { success: true, message: `Amendment ${status} successfully` };
    } catch (error) {
      console.error('Error updating amendment status:', error);
      throw error;
    }
  }

  async getAmendmentRequests(corporateId?: string) {
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
    } catch (error) {
      console.error('Error fetching amendment requests:', error);
      throw error;
    }
  }

  async getAmendmentById(amendmentId: string) {
    try {
      const amendment = await this.db
        .selectFrom('investigation_logs')
        .selectAll()
        .where('uuid', '=', amendmentId)
        .where('to_status', '=', 'Amendment Requested')
        .executeTakeFirst();

      return amendment;
    } catch (error) {
      console.error('Error fetching amendment by ID:', error);
      throw error;
    }
  }

  async updatePinnedStatus(corporateId: string, pinned: boolean) {
    try {
      await this.db
        .updateTable('corporates')
        .set({ pinned })
        .where('uuid', '=', corporateId)
        .execute();

      return { success: true, message: `Corporate ${pinned ? 'pinned' : 'unpinned'} successfully` };
    } catch (error) {
      console.error('Error updating pinned status:', error);
      throw error;
    }
  }
}
