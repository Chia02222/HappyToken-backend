import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { sql } from 'kysely';
import { CreateSubsidiaryDto, UpdateSubsidiaryDto} from './dto/subsidiary.dto';

@Injectable()
export class SubsidiariesService {
  constructor(private readonly dbService: DatabaseService) {}

  private get db() {
    return this.dbService.getDb();
  }

  async addSubsidiary(subsidiaryData: CreateSubsidiaryDto | (CreateSubsidiaryDto & { corporate_uuid?: string })) {
    console.log('addSubsidiary called with:', subsidiaryData);
    const { id: _id, ...insertData } = subsidiaryData as any; // omit 'id'; accept uuid linkage
    const inserted = await this.db
      .insertInto('subsidiaries')
      .values({
        ...(insertData as any),
        created_at: sql`date_trunc('second', now())::timestamp(0)`,
        updated_at: sql`date_trunc('second', now())::timestamp(0)`,
      } as any)
      .returningAll()
      .executeTakeFirst();
    return inserted!;
  }

  async updateSubsidiary(uuid: string, subsidiaryData: UpdateSubsidiaryDto) {
    console.log('updateSubsidiary called with:', { uuid, subsidiaryData });
    const { id: _subsidiaryId, ...updateData } = subsidiaryData;
    const updated = await this.db
      .updateTable('subsidiaries')
      .set({
        ...updateData,
        updated_at: sql`date_trunc('second', now())::timestamp(0)`,
      })
      .where('uuid', '=', uuid)
      .returningAll()
      .executeTakeFirst();
    return updated!;
  }

  async deleteSubsidiary(uuid: string) {
    console.log('deleteSubsidiary called with uuid:', uuid);
    await this.db.deleteFrom('subsidiaries').where('uuid', '=', uuid).execute();
    return { success: true };
  }
}
