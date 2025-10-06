import { DatabaseService } from '../../database/database.service';
import { UpdateContactDto } from './dto/contact.dto';
export declare class ContactsService {
    private readonly dbService;
    constructor(dbService: DatabaseService);
    private get db();
    addContact(contactData: any): Promise<{
        uuid: string;
        created_at: string;
        updated_at: string;
        corporate_uuid: string;
        salutation: string;
        first_name: string;
        last_name: string;
        contact_number: string;
        email: string;
        company_role: string;
        system_role: string;
    }>;
    updateContact(uuid: string, contactData: UpdateContactDto): Promise<{
        uuid: string;
        created_at: string;
        updated_at: string;
        corporate_uuid: string;
        salutation: string;
        first_name: string;
        last_name: string;
        contact_number: string;
        email: string;
        company_role: string;
        system_role: string;
    }>;
    deleteContact(uuid: string): Promise<{
        success: boolean;
    }>;
}
