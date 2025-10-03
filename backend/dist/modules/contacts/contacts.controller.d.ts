import { ContactsService } from './contacts.service';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';
export declare class ContactsController {
    private readonly contactsService;
    constructor(contactsService: ContactsService);
    addContact(corporateUuid: string, contactData: Omit<CreateContactDto, 'corporate_id'>): Promise<{
        uuid: string;
        corporate_uuid: string;
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
    updateContact(uuid: string, contactData: UpdateContactDto): Promise<{
        uuid: string;
        corporate_uuid: string;
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
    deleteContact(uuid: string): Promise<{
        success: boolean;
    }>;
}
