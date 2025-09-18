import { DatabaseService } from '../database/database.service';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';
export declare class ContactsService {
    private readonly dbService;
    constructor(dbService: DatabaseService);
    private get db();
    addContact(contactData: CreateContactDto): Promise<{
        id: string;
        corporate_id: string;
        salutation: string;
        first_name: string;
        last_name: string;
        contact_number: string;
        email: string;
        company_role: string;
        system_role: string;
        created_at: string;
        updated_at: string;
    }>;
    updateContact(id: string, contactData: UpdateContactDto): Promise<{
        id: string;
        corporate_id: string;
        salutation: string;
        first_name: string;
        last_name: string;
        contact_number: string;
        email: string;
        company_role: string;
        system_role: string;
        created_at: string;
        updated_at: string;
    }>;
    deleteContact(id: string): Promise<{
        success: boolean;
    }>;
}
