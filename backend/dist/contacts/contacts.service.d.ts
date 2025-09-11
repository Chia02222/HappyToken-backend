import { DatabaseService } from '../database/database.service';
import { ContactTable } from '../database/types';
export declare class ContactsService {
    private readonly dbService;
    constructor(dbService: DatabaseService);
    private get db();
    findAll(params?: {
        corporate_id?: number;
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
        id: number;
        created_at: string;
        updated_at: string;
        corporate_id: number;
    }[]>;
    findById(id: number): Promise<{
        salutation: string;
        first_name: string;
        last_name: string;
        contact_number: string;
        email: string;
        company_role: string;
        system_role: string;
        id: number;
        created_at: string;
        updated_at: string;
        corporate_id: number;
    }>;
    create(data: Omit<ContactTable, 'id' | 'created_at' | 'updated_at'>): Promise<{
        salutation: string;
        first_name: string;
        last_name: string;
        contact_number: string;
        email: string;
        company_role: string;
        system_role: string;
        id: number;
        created_at: string;
        updated_at: string;
        corporate_id: number;
    }>;
    update(id: number, data: Partial<Omit<ContactTable, 'id' | 'created_at'>>): Promise<{
        salutation: string;
        first_name: string;
        last_name: string;
        contact_number: string;
        email: string;
        company_role: string;
        system_role: string;
        id: number;
        created_at: string;
        updated_at: string;
        corporate_id: number;
    }>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
}
