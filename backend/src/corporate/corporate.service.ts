import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  CorporateTable,
  InvestigationLogTable,
  CorporateStatus,
  NewCorporate,
} from '../database/types';
import { sql } from 'kysely';
import { CreateCorporateWithRelationsDto,UpdateCorporateDto } from './dto/corporate.dto';
import { CreateContactDto } from '../contacts/dto/contact.dto';
import { CreateSubsidiaryDto } from '../subsidiaries/dto/subsidiary.dto';
import { ContactsService } from '../contacts/contacts.service';
import { SubsidiariesService } from '../subsidiaries/subsidiaries.service';

@Injectable()
export class CorporateService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly contactsService: ContactsService,
    private readonly subsidiariesService: SubsidiariesService,
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

  async create(corporateData: CreateCorporateWithRelationsDto) {
    const { contacts, subsidiaries, /* not a column */ investigation_log, ...corporateBaseData } = corporateData as any;

    const corporateInsertData: NewCorporate = {
      ...corporateBaseData,
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

    return inserted!;
  }

  async update(id: string, updateData: UpdateCorporateDto) {
    console.log('CorporateService.update called with id:', id);
    try {
      console.log('Raw updateData:', JSON.stringify(updateData));
    } catch {}
    const {
      contacts,
      subsidiaries,
      contactIdsToDelete,
      subsidiaryIdsToDelete,
      // investigation logs are stored in a separate table; ensure it's not applied to corporates update
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      investigation_log,
      // never allow updating primary key
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      id: _ignoreId,
      ...corporateUpdateData
    } = updateData;

    console.log('Derived corporateUpdateData keys:', Object.keys(corporateUpdateData));
    console.log('contactIdsToDelete:', contactIdsToDelete);
    console.log('subsidiaryIdsToDelete:', subsidiaryIdsToDelete);

    const updatedCorporate = await this.db
      .updateTable('corporates')
      .set({
        ...(corporateUpdateData as Partial<CorporateTable>),
        agreement_from: corporateUpdateData.agreement_from === '' ? null : corporateUpdateData.agreement_from,
        agreement_to: corporateUpdateData.agreement_to === '' ? null : corporateUpdateData.agreement_to,
        updated_at: sql`date_trunc('second', now())::timestamp(0)` as unknown as string,
      } as any)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    if (!updatedCorporate) {
      return null;
    }

    const isUuid = (value: unknown) => typeof value === 'string' && /^[0-9a-fA-F-]{36}$/.test(value);

    if (contacts) {
      for (const contact of contacts) {
        if (isUuid(contact.id as any)) {
          await this.contactsService.updateContact(contact.id as string, contact);
        } else {
          await this.contactsService.addContact({ ...(contact as CreateContactDto), corporate_id: id });
        }
      }
    }

    if (contactIdsToDelete) {
        for (const contactId of contactIdsToDelete) {
            console.log('Attempting to delete contactId:', contactId);
            if (!contactId) { console.warn('Skipping empty contactId'); continue; }
            await this.contactsService.deleteContact(contactId);
        }
    }

    if (subsidiaries) {
      for (const subsidiary of subsidiaries) {
        if (isUuid(subsidiary.id as any)) {
          await this.subsidiariesService.updateSubsidiary(subsidiary.id as string, subsidiary);
        } else {
          await this.subsidiariesService.addSubsidiary({ ...(subsidiary as CreateSubsidiaryDto), corporate_id: id });
        }
      }
    }

    if (subsidiaryIdsToDelete) {
        for (const subsidiaryId of subsidiaryIdsToDelete) {
            console.log('Attempting to delete subsidiaryId:', subsidiaryId);
            if (!subsidiaryId) { console.warn('Skipping empty subsidiaryId'); continue; }
            await this.subsidiariesService.deleteSubsidiary(subsidiaryId);
        }
    }

    return this.findById(id);
  }

  async delete(id: string) {
    await this.db.deleteFrom('corporates').where('id', '=', id).execute();
    return { success: true };
  }

  async addInvestigationLog(corporateId: string, logData: Omit<InvestigationLogTable, 'id' | 'corporate_id' | 'created_at'>) {
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
    const corporate = await this.findById(id);
    if (!corporate) {
      throw new Error('Corporate not found');
    }

    if (note) {
      await this.addInvestigationLog(id, {
        timestamp: new Date().toISOString(),
        note,
        from_status: corporate.status as any,
        to_status: status as any,
      });
    }

    return await this.update(id, { status: status as CorporateStatus });
  }
}