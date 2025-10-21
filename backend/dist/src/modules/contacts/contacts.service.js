import { DatabaseService } from '../../database/database.service';
import { sql } from 'kysely';
export class ContactsService {
    dbService;
    constructor() {
        this.dbService = new DatabaseService();
    }
    get db() {
        return this.dbService.getDb();
    }
    async addContact(contactData) {
        const { id: _id, ...contactDataWithoutId } = contactData;
        const insertData = {
            corporate_uuid: contactDataWithoutId.corporate_uuid,
            salutation: contactDataWithoutId.salutation,
            first_name: contactDataWithoutId.first_name,
            last_name: contactDataWithoutId.last_name,
            contact_number: contactDataWithoutId.contact_number,
            email: contactDataWithoutId.email,
            company_role: contactDataWithoutId.company_role,
            system_role: contactDataWithoutId.system_role,
        };
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
            created_at: sql `date_trunc('second', now())::timestamp(0)`,
            updated_at: sql `date_trunc('second', now())::timestamp(0)`,
        })
            .returningAll()
            .executeTakeFirst();
        return inserted;
    }
    async updateContact(uuid, contactData) {
        const { id: _contactId, ...updateData } = contactData;
        const updated = await this.db
            .updateTable('contacts')
            .set({
            ...updateData,
            updated_at: sql `date_trunc('second', now())::timestamp(0)`,
        })
            .where('uuid', '=', uuid)
            .returningAll()
            .executeTakeFirst();
        return updated;
    }
    async deleteContact(uuid) {
        await this.db.deleteFrom('contacts').where('uuid', '=', uuid).execute();
        return { success: true };
    }
    async findAll() {
        return await this.db.selectFrom('contacts').selectAll().execute();
    }
    async findById(uuid) {
        return await this.db.selectFrom('contacts').selectAll().where('uuid', '=', uuid).executeTakeFirst();
    }
}
//# sourceMappingURL=contacts.service.js.map