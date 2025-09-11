import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CorporateTable, ContactTable, SubsidiaryTable, InvestigationLogTable, CorporateStatus } from '../database/types';
import { sql } from 'kysely';
import { UpdateCorporateDto, UpdateContactDto, UpdateSubsidiaryDto, CreateContactDto, CreateSubsidiaryDto } from './dto/update-corporate.dto';

@Injectable()
export class CorporateService {
  constructor(private readonly dbService: DatabaseService) {}

  private get db() {
    return this.dbService.getDb();
  }

  // Get all corporates
  async findAll() {
    return await this.db
      .selectFrom('corporates')
      .selectAll()
      .orderBy('created_at', 'desc')
      .execute();
  }

  // Get corporate by ID with related data
  async findById(id: number) {
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

  // Create new corporate
  async create(corporateData: Omit<CorporateTable, 'id' | 'created_at' | 'updated_at'>) {
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
        created_at: sql`now()`,
        updated_at: sql`now()`,
      })
      .returningAll()
      .executeTakeFirst();

    return inserted!;
  }

  // Update corporate
  async update(id: number, updateData: UpdateCorporateDto) {
    const { contacts, subsidiaries, contactIdsToDelete, subsidiaryIdsToDelete, ...corporateUpdateData } = updateData;

    // Update main corporate table
    const updatedCorporate = await this.db
      .updateTable('corporates')
      .set({
        ...corporateUpdateData,
        updated_at: sql`now()`,
      } as any)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    if (!updatedCorporate) {
      return null;
    }

    // Handle contacts
    if (contacts) {
      for (const contact of contacts) {
        if (contact.id) {
          // Update existing contact
          await this.updateContact(contact.id, contact);
        } else {
          // Add new contact
          await this.addContact(id, contact as CreateContactDto);
        }
      }
    }

    // Handle contact deletions
    if (contactIdsToDelete) {
      for (const contactId of contactIdsToDelete) {
        await this.deleteContact(contactId);
      }
    }

    // Handle subsidiaries
    if (subsidiaries) {
      for (const subsidiary of subsidiaries) {
        if (subsidiary.id) {
          // Update existing subsidiary
          await this.updateSubsidiary(subsidiary.id, subsidiary);
        } else {
          // Add new subsidiary
          await this.addSubsidiary(id, subsidiary as CreateSubsidiaryDto);
        }
      }
    }

    // Handle subsidiary deletions
    if (subsidiaryIdsToDelete) {
      for (const subsidiaryId of subsidiaryIdsToDelete) {
        await this.deleteSubsidiary(subsidiaryId);
      }
    }

    // Return the updated corporate with its related data
    return this.findById(id);
  }

  // Delete corporate
  async delete(id: number) {
    await this.db.deleteFrom('corporates').where('id', '=', id).execute();
    return { success: true };
  }

  // Add contact to corporate
  async addContact(corporateId: number, contactData: CreateContactDto) {
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
        created_at: sql`now()`,
        updated_at: sql`now()`,
      })
      .returningAll()
      .executeTakeFirst();
    return inserted!;
  }

  // Add subsidiary to corporate
  async addSubsidiary(corporateId: number, subsidiaryData: CreateSubsidiaryDto) {
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
        created_at: sql`now()`,
        updated_at: sql`now()`,
      })
      .returningAll()
      .executeTakeFirst();
    return inserted!;
  }

  // Add investigation log entry
  async addInvestigationLog(corporateId: number, logData: Omit<InvestigationLogTable, 'id' | 'corporate_id' | 'created_at'>) {
    const inserted = await this.db
      .insertInto('investigation_logs')
      .values({
        corporate_id: corporateId,
        timestamp: logData.timestamp,
        note: logData.note ?? null,
        from_status: logData.from_status ?? null,
        to_status: logData.to_status ?? null,
        created_at: sql`now()`,
      })
      .returningAll()
      .executeTakeFirst();
    return inserted!;
  }

  // Update contact
  async updateContact(id: number, contactData: UpdateContactDto) {
    const updated = await this.db
      .updateTable('contacts')
      .set({
        ...contactData,
        updated_at: sql`now()`,
      } as any)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return updated!;
  }

  // Delete contact
  async deleteContact(id: number) {
    await this.db.deleteFrom('contacts').where('id', '=', id).execute();
    return { success: true };
  }

  // Update subsidiary
  async updateSubsidiary(id: number, subsidiaryData: UpdateSubsidiaryDto) {
    const updated = await this.db
      .updateTable('subsidiaries')
      .set({
        ...subsidiaryData,
        updated_at: sql`now()`,
      } as any)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return updated!;
  }

  // Delete subsidiary
  async deleteSubsidiary(id: number) {
    await this.db.deleteFrom('subsidiaries').where('id', '=', id).execute();
    return { success: true };
  }

  // Update corporate status
  async updateStatus(id: number, status: string, note?: string) {
    const corporate = await this.findById(id);
    if (!corporate) {
      throw new Error('Corporate not found');
    }

    // Add investigation log entry
    if (note) {
      await this.addInvestigationLog(id, {
        timestamp: new Date().toISOString(),
        note,
        from_status: corporate.status as any,
        to_status: status as any,
      });
    }

    // Update status
    return await this.update(id, { status: status as CorporateStatus });
  }
}
