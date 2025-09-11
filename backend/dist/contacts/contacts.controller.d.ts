import { ContactsService } from './contacts.service';
import { ContactTable } from '../database/types';
export declare class ContactsController {
    private readonly contactsService;
    constructor(contactsService: ContactsService);
    findAll(corporateId?: string, limit?: string, offset?: string): Promise<{
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
    create(body: Omit<ContactTable, 'id' | 'created_at' | 'updated_at'>): Promise<{
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
    update(id: number, body: Partial<Omit<ContactTable, 'id' | 'created_at'>>): Promise<{
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
