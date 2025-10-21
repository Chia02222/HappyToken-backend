import { DatabaseService } from '../../database/database.service';
import { sql } from 'kysely';
export class SubsidiariesService {
    dbService;
    constructor() {
        this.dbService = new DatabaseService();
    }
    get db() {
        return this.dbService.getDb();
    }
    async addSubsidiary(subsidiaryData) {
        const { id: _id, ...insertData } = subsidiaryData;
        const inserted = await this.db
            .insertInto('subsidiaries')
            .values({
            ...insertData,
            created_at: sql `date_trunc('second', now())::timestamp(0)`,
            updated_at: sql `date_trunc('second', now())::timestamp(0)`,
        })
            .returningAll()
            .executeTakeFirst();
        return inserted;
    }
    async updateSubsidiary(uuid, subsidiaryData) {
        const { id: _subsidiaryId, ...updateData } = subsidiaryData;
        const updated = await this.db
            .updateTable('subsidiaries')
            .set({
            ...updateData,
            updated_at: sql `date_trunc('second', now())::timestamp(0)`,
        })
            .where('uuid', '=', uuid)
            .returningAll()
            .executeTakeFirst();
        return updated;
    }
    async deleteSubsidiary(uuid) {
        await this.db.deleteFrom('subsidiaries').where('uuid', '=', uuid).execute();
        return { success: true };
    }
    async findAll() {
        return await this.db.selectFrom('subsidiaries').selectAll().execute();
    }
    async findById(uuid) {
        return await this.db.selectFrom('subsidiaries').selectAll().where('uuid', '=', uuid).executeTakeFirst();
    }
}
//# sourceMappingURL=subsidiaries.service.js.map