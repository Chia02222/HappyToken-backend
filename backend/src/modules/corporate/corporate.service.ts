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

// Define a type for CorporateTable without the 'id' property
type UpdatableCorporateTable = Omit<CorporateTable, 'id'>;

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

  async create(corporateData: Omit<CreateCorporateWithRelationsDto, 'investigation_log'>) {
    const { contacts, subsidiaries, secondary_approver, ...corporateBaseData } = corporateData;

    const corporateInsertData: NewCorporate = {
      ...corporateBaseData,
      agreement_from: corporateBaseData.agreement_from === '' ? null : corporateBaseData.agreement_from,
      agreement_to: corporateBaseData.agreement_to === '' ? null : corporateBaseData.agreement_to,
      created_at: sql`date_trunc('second', now())::timestamp(0)` as unknown as string,
      updated_at: sql`date_trunc('second', now())::timestamp(0)` as unknown as string,
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
      let secondaryApproverId: number | undefined;

      if (secondary_approver.use_existing_contact && secondary_approver.selected_contact_id) {
        // Update existing contact
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
      } else if (!secondary_approver.use_existing_contact) {
        // Create new contact
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
        secondaryApproverId = insertedContact.id as unknown as number;
      }

      if (secondaryApproverId !== undefined) {
        await this.db
          .updateTable('corporates')
          .set({
            secondary_approver_id: secondaryApproverId,
            updated_at: sql`date_trunc('second', now())::timestamp(0)` as unknown as string,
          })
          .where('id', '=', inserted.id)
          .execute();
      }
    }

    return inserted!;
  }

  async update(id: string, updateData: UpdateCorporateDto) {
    console.log('CorporateService.update called with id:', id);
    try {
      console.log('Raw updateData:', JSON.stringify(updateData));
    } catch {}

    // Explicitly remove investigation_log from updateData if it exists
    const { investigation_log: _investigation_log, ...restOfUpdateData } = updateData as UpdateCorporateDto & { investigation_log?: InvestigationLogTable };

    const {
      id: _updateDtoId,
      contacts,
      subsidiaries,
      contactIdsToDelete,
      subsidiaryIdsToDelete,
      secondary_approver: _secondary_approver,
      ...corporateUpdateData // This should now be free of 'id' and 'investigation_log'
    } = restOfUpdateData;

    const idNum = Number(id);
    const secondaryApproverData = updateData.secondary_approver;

    console.log('Derived corporateUpdateData keys:', Object.keys(corporateUpdateData));
    console.log('contactIdsToDelete:', contactIdsToDelete);
    console.log('subsidiaryIdsToDelete:', subsidiaryIdsToDelete);

    if (secondaryApproverData) {
      let secondaryApproverId: number | undefined;

      if (secondaryApproverData.use_existing_contact && secondaryApproverData.selected_contact_id) {
        // Update existing contact
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
      } else if (!secondaryApproverData.use_existing_contact) {
        // Create new contact
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
        secondaryApproverId = insertedContact.id as unknown as number;
      }

      if (secondaryApproverId !== undefined) {
        await this.db
          .updateTable('corporates')
          .set({
            secondary_approver_id: secondaryApproverId,
            updated_at: sql`date_trunc('second', now())::timestamp(0)` as unknown as string,
          })
          .where('id', '=', idNum)
          .execute();
      }
    }

    // Explicitly construct the update object to ensure 'id' is not included
    const corporateFieldsToUpdate: Partial<UpdatableCorporateTable> = {
      ...corporateUpdateData, // This should not contain 'id'
      agreement_from: corporateUpdateData.agreement_from === '' ? null : corporateUpdateData.agreement_from,
      agreement_to: corporateUpdateData.agreement_to === '' ? null : corporateUpdateData.agreement_to,
      updated_at: sql`date_trunc('second', now())::timestamp(0)` as unknown as string,
    };

    // idNum declared above
    const updatedCorporate = await this.db
      .updateTable('corporates')
      .set(corporateFieldsToUpdate) // Pass the explicitly constructed object
      .where('id', '=', idNum)
      .returningAll()
      .executeTakeFirst();

    if (!updatedCorporate) {
      return null;
    }

    const isUuid = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-fA-F-]{36}$/.test(value);
    const isNumericString = (value: unknown): value is string => typeof value === 'string' && /^\d+$/.test(value);
    const isClientTempId = (value: unknown): boolean => typeof value === 'string' && value.startsWith('client-');
    const isPersistedId = (value: unknown): boolean => isUuid(value) || isNumericString(value) || typeof value === 'number';

    if (contacts) {
      for (const contact of contacts) {
        console.log('Processing contact:', contact);
        const cid = (contact as any).id;
        if (isPersistedId(cid)) {
          await this.contactsService.updateContact(Number(cid), contact);
        } else if (!cid || isClientTempId(cid)) {
          await this.contactsService.addContact({ ...(contact as CreateContactDto), corporate_id: idNum });
        } else {
          // Fallback: try update when id is truthy but not recognized as temp
          await this.contactsService.updateContact(Number(cid), contact);
        }
      }
    }

    if (contactIdsToDelete) {
        for (const contactId of contactIdsToDelete) {
            console.log('Attempting to delete contactId:', contactId);
            if (!contactId) { console.warn('Skipping empty contactId'); continue; }
            await this.contactsService.deleteContact(Number(contactId));
        }
    }

    if (subsidiaries) {
      for (const subsidiary of subsidiaries) {
        const sid = (subsidiary as any).id;
        if (isPersistedId(sid)) {
          await this.subsidiariesService.updateSubsidiary(Number(sid), subsidiary);
        } else if (!sid || isClientTempId(sid)) {
          await this.subsidiariesService.addSubsidiary({ ...(subsidiary as CreateSubsidiaryDto), corporate_id: idNum });
        } else {
          await this.subsidiariesService.updateSubsidiary(Number(sid), subsidiary);
        }
      }
    }

    if (subsidiaryIdsToDelete) {
        for (const subsidiaryId of subsidiaryIdsToDelete) {
            console.log('Attempting to delete subsidiaryId:', subsidiaryId);
            if (!subsidiaryId) { console.warn('Skipping empty subsidiaryId'); continue; }
            await this.subsidiariesService.deleteSubsidiary(Number(subsidiaryId));
        }
    }

    const result = await this.findById(String(id));
    console.log('CorporateService.update returning:', JSON.stringify(result));
    return result;
  }

  async delete(id: string) {
    const idNum = Number(id);
    await this.db.transaction().execute(async (trx) => {
      // Delete related investigation logs
      await trx.deleteFrom('investigation_logs').where('corporate_id', '=', idNum).execute();
      // Delete related contacts
      await trx.deleteFrom('contacts').where('corporate_id', '=', idNum).execute();
      // Delete related subsidiaries
      await trx.deleteFrom('subsidiaries').where('corporate_id', '=', idNum).execute();
      // Finally, delete the corporate record
      await trx.deleteFrom('corporates').where('id', '=', idNum).execute();
    });
    return { success: true };
  }

  async addInvestigationLog(corporateId: string, logData: Omit<InvestigationLogTable, 'id' | 'corporate_id' | 'created_at'>) {
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
          created_at: sql`date_trunc('second', now())::timestamp(0)` as unknown as string,
        })
        .returningAll()
        .executeTakeFirst();
      console.log('Investigation log inserted:', inserted);
      return inserted!;
    } catch (error) {
      console.error('Error inserting investigation log:', error);
      throw error;
    }
  }

  async updateStatus(id: string, status: string, note?: string) {
    const idNum = Number(id);
    const corporate = await this.findById(String(id));
    if (!corporate) {
      throw new Error('Corporate not found');
    }

    const oldStatus = corporate.status;

    const shouldLog = !(
      !note &&
      (oldStatus === 'Resolved' && status === 'Approved')
    );

    if ((note || status !== oldStatus) && shouldLog) {
      await this.addInvestigationLog(id, {
        timestamp: new Date().toISOString(),
                note: note === undefined ? `Status changed from ${oldStatus} to ${status}` : note,        from_status: oldStatus as CorporateStatus,
        to_status: status as CorporateStatus,
      });

      if (status === 'Rejected' || status === 'Under Fraud Investigation') {
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
        const coolingPeriodEnd = new Date(coolingPeriodStart.getTime() + 30 * 1000); // 30 seconds from now

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
          } catch (error) {
            console.error(`[setTimeout] Error completing cooling period for corporate ${id}:`, error);
          }
        }, 30000); // 30 seconds
      }
    }

    return await this.update(String(id), { status: status as CorporateStatus });
  }

  async handleCoolingPeriodCompletion(corporateId: string) {
    console.log(`[handleCoolingPeriodCompletion] called for corporateId: ${corporateId}`);
    const corporate = await this.findById(corporateId);
    if (!corporate) {
      console.error(`[handleCoolingPeriodCompletion] Corporate ${corporateId} not found.`);
      throw new Error('Corporate not found');
    }
    console.log(`[handleCoolingPeriodCompletion] Corporate found: ${JSON.stringify(corporate)}`);

    // Check if any contact has the suspicious number
    const hasSuspiciousContact = corporate.contacts.some(
      (contact) => contact.contact_number === '0123456789'
    );
    console.log(`[handleCoolingPeriodCompletion] Has suspicious contact (0123456789): ${hasSuspiciousContact}`);


    let newStatus: CorporateStatus;
    let note: string;

    if (hasSuspiciousContact) {
      newStatus = 'Under Fraud Investigation';
      note = `Corporate flagged for fraud investigation due to contact number.`;
      console.log(`[handleCoolingPeriodCompletion] Updating status to: ${newStatus}`);
      await this.updateStatus(corporateId, newStatus, note);
    } else {
      newStatus = 'Approved';
      await this.updateStatus(corporateId, newStatus);
    }

    const updatedCorporate = await this.findById(corporateId);
    console.log(`[handleCoolingPeriodCompletion] Status updated successfully for corporate ${corporateId}. New status: ${updatedCorporate?.status}`);
    console.log(`[handleCoolingPeriodCompletion] Returning corporate: ${JSON.stringify(updatedCorporate)}`);
    return updatedCorporate;
  }
}
