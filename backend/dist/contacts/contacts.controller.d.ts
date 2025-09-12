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
    create(body: Omit<ContactTable, 'id' | 'created_at' | 'updated_at'>): Promise<{
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
    update(id: string, body: Partial<Omit<ContactTable, 'id' | 'created_at'>>): Promise<{
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
