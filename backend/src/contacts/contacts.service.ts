import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { sql } from 'kysely';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';


@Injectable()
export class ContactsService {
  constructor(private readonly dbService: DatabaseService) {}

  private get db() {
    return this.dbService.getDb();
  }

  async addContact(contactData: CreateContactDto) {
    console.log('addContact called with:', contactData);
    // Ignore any client-provided id; let DB generate UUID
    const { id: _ignoreId, ...insertData } = contactData as any;

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
        created_at: sql`date_trunc('second', now())::timestamp(0)`,
        updated_at: sql`date_trunc('second', now())::timestamp(0)`,
      })
      .returningAll()
      .executeTakeFirst();
    return inserted!;
  }

  async updateContact(id: string, contactData: UpdateContactDto) {
    console.log('updateContact called with:', { id, contactData });
    // Never update primary key
    const { id: _ignoreId, ...updateData } = contactData as any;
    const updated = await this.db
      .updateTable('contacts')
      .set({
        ...updateData,
        updated_at: sql`date_trunc('second', now())::timestamp(0)`,
      } as any)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return updated!;
  }

  async deleteContact(id: string) {
    console.log('deleteContact called with id:', id);
    await this.db.deleteFrom('contacts').where('id', '=', id).execute();
    return { success: true };
  }
}
