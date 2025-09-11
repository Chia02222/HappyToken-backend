import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ContactTable } from '../database/types';
import { sql } from 'kysely';

@Injectable()
export class ContactsService {
  constructor(private readonly dbService: DatabaseService) {}

  private get db() {
    return this.dbService.getDb();
  }

  async findAll(params: { corporate_id?: number; limit?: number; offset?: number } = {}) {
    const { corporate_id, limit = 50, offset = 0 } = params;
    let q = this.db.selectFrom('contacts').selectAll().orderBy('created_at', 'desc');
    if (corporate_id) {
      q = q.where('corporate_id', '=', corporate_id);
    }
    return await q.limit(limit).offset(offset).execute();
  }

  async findById(id: number) {
    const row = await this.db.selectFrom('contacts').selectAll().where('id', '=', id).executeTakeFirst();
    if (!row) throw new NotFoundException('Contact not found');
    return row;
  }

  async create(data: Omit<ContactTable, 'id' | 'created_at' | 'updated_at'>) {
    const inserted = await this.db
      .insertInto('contacts')
      .values({
        corporate_id: data.corporate_id,
        salutation: data.salutation,
        first_name: data.first_name,
        last_name: data.last_name,
        contact_number: data.contact_number,
        email: data.email,
        company_role: data.company_role,
        system_role: data.system_role,
        created_at: sql`now()`,
        updated_at: sql`now()`,
      })
      .returningAll()
      .executeTakeFirst();
    return inserted!;
  }

  async update(id: number, data: Partial<Omit<ContactTable, 'id' | 'created_at'>>) {
    const updated = await this.db
      .updateTable('contacts')
      .set({ ...(data as any), updated_at: sql`now()` })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    if (!updated) throw new NotFoundException('Contact not found');
    return updated;
  }

  async delete(id: number) {
    const res = await this.db.deleteFrom('contacts').where('id', '=', id).returning('id').executeTakeFirst();
    if (!res) throw new NotFoundException('Contact not found');
    return { success: true };
  }
}


