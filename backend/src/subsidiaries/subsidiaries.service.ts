import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SubsidiaryTable } from '../database/types';
import { sql } from 'kysely';

@Injectable()
export class SubsidiariesService {
  constructor(private readonly dbService: DatabaseService) {}

  private get db() {
    return this.dbService.getDb();
  }

  async findAll(params: { corporate_id?: string; limit?: number; offset?: number } = {}) {
    const { corporate_id, limit = 50, offset = 0 } = params;
    let q = this.db.selectFrom('subsidiaries').selectAll().orderBy('created_at', 'desc');
    if (corporate_id) q = q.where('corporate_id', '=', corporate_id);
    return await q.limit(limit).offset(offset).execute();
  }

  async findById(id: string) {
    const row = await this.db.selectFrom('subsidiaries').selectAll().where('id', '=', id).executeTakeFirst();
    if (!row) throw new NotFoundException('Subsidiary not found');
    return row;
  }

  async create(data: Omit<SubsidiaryTable, 'id' | 'created_at' | 'updated_at'>) {
    const inserted = await this.db
      .insertInto('subsidiaries')
      .values({
        corporate_id: data.corporate_id,
        company_name: data.company_name,
        reg_number: data.reg_number,
        office_address1: data.office_address1,
        office_address2: data.office_address2,
        postcode: data.postcode,
        city: data.city,
        state: data.state,
        country: data.country,
        website: data.website,
        account_note: data.account_note,
        created_at: sql`now()`,
        updated_at: sql`now()`,
      })
      .returningAll()
      .executeTakeFirst();
    return inserted!;
  }

  async update(id: string, data: Partial<Omit<SubsidiaryTable, 'id' | 'created_at'>>) {
    const updated = await this.db
      .updateTable('subsidiaries')
      .set({ ...(data as any), updated_at: sql`now()` })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    if (!updated) throw new NotFoundException('Subsidiary not found');
    return updated;
  }

  async delete(id: string) {
    const res = await this.db.deleteFrom('subsidiaries').where('id', '=', id).returning('id').executeTakeFirst();
    if (!res) throw new NotFoundException('Subsidiary not found');
    return { success: true };
  }
}


