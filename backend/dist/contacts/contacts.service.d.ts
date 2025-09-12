import { DatabaseService } from '../database/database.service';
import { ContactTable } from '../database/types';
export declare class ContactsService {
    private readonly dbService;
    constructor(dbService: DatabaseService);
    private get db();
    findAll(params?: {
        corporate_id?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        salutation: string;
        first_name: string;
        last_name: string;
        contact_number: string;
        email: string;
        company_role: string;
        system_role: string;
        id: string;
        created_at: string;
        updated_at: string;
        corporate_id: string;
    }[]>;
    findById(id: string): Promise<{
        salutation: string;
        first_name: string;
        last_name: string;
        contact_number: string;
        email: string;
        company_role: string;
        system_role: string;
        id: string;
        created_at: string;
        updated_at: string;
        corporate_id: string;
    }>;
    create(data: Omit<ContactTable, 'id' | 'created_at' | 'updated_at'>): Promise<{
        salutation: string;
        first_name: string;
        last_name: string;
        contact_number: string;
        email: string;
        company_role: string;
        system_role: string;
        id: string;
        created_at: string;
        updated_at: string;
        corporate_id: string;
    }>;
    update(id: string, data: Partial<Omit<ContactTable, 'id' | 'created_at'>>): Promise<{
        salutation: string;
        first_name: string;
        last_name: string;
        contact_number: string;
        email: string;
        company_role: string;
        system_role: string;
        id: string;
        created_at: string;
        updated_at: string;
        corporate_id: string;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
