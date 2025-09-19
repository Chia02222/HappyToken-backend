import { ContactsService } from './contacts.service';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';
export declare class ContactsController {
    private readonly contactsService;
    constructor(contactsService: ContactsService);
    addContact(corporateId: string, contactData: Omit<CreateContactDto, 'corporate_id'>): Promise<{
        id: string;
        created_at: string;
        updated_at: string;
        corporate_id: string;
        salutation: string;
        first_name: string;
        last_name: string;
        contact_number: string;
        email: string;
        company_role: string;
        system_role: string;
    }>;
    updateContact(id: string, contactData: UpdateContactDto): Promise<{
        id: string;
        created_at: string;
        updated_at: string;
        corporate_id: string;
        salutation: string;
        first_name: string;
        last_name: string;
        contact_number: string;
        email: string;
        company_role: string;
        system_role: string;
    }>;
    deleteContact(id: string): Promise<{
        success: boolean;
    }>;
}
