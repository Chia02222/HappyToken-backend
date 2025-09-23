import { DatabaseService } from '../database/database.service';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';
export declare class ContactsService {
    private readonly dbService;
    constructor(dbService: DatabaseService);
    private get db();
    addContact(contactData: CreateContactDto): Promise<{
        id: number;
        created_at: string;
        updated_at: string;
        corporate_id: number;
        salutation: string;
        first_name: string;
        last_name: string;
        contact_number: string;
        email: string;
        company_role: string;
        system_role: string;
    }>;
    updateContact(id: number, contactData: UpdateContactDto): Promise<{
        id: number;
        created_at: string;
        updated_at: string;
        corporate_id: number;
        salutation: string;
        first_name: string;
        last_name: string;
        contact_number: string;
        email: string;
        company_role: string;
        system_role: string;
    }>;
    deleteContact(id: number): Promise<{
        success: boolean;
    }>;
}
