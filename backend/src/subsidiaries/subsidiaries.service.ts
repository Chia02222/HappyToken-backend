import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { sql } from 'kysely';
import { CreateSubsidiaryDto, UpdateSubsidiaryDto} from './dto/subsidiary.dto';

@Injectable()
export class SubsidiariesService {
  constructor(private readonly dbService: DatabaseService) {}

  private get db() {
    return this.dbService.getDb();
  }

  async addSubsidiary(subsidiaryData: CreateSubsidiaryDto) {
    console.log('addSubsidiary called with:', subsidiaryData);
    const insertData = { ...subsidiaryData };
    const inserted = await this.db
      .insertInto('subsidiaries')
      .values({
        ...insertData,
        created_at: sql`date_trunc('second', now())::timestamp(0)`,
        updated_at: sql`date_trunc('second', now())::timestamp(0)`,
      })
      .returningAll()
      .executeTakeFirst();
    return inserted!;
  }

  async updateSubsidiary(id: string, subsidiaryData: UpdateSubsidiaryDto) {
    console.log('updateSubsidiary called with:', { id, subsidiaryData });
    const { id: _subsidiaryId, ...updateData } = subsidiaryData;
    const updated = await this.db
      .updateTable('subsidiaries')
      .set({
        ...updateData,
        updated_at: sql`date_trunc('second', now())::timestamp(0)`,
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return updated!;
  }

  async deleteSubsidiary(id: string) {
    console.log('deleteSubsidiary called with id:', id);
    await this.db.deleteFrom('subsidiaries').where('id', '=', id).execute();
    return { success: true };
  }
}
