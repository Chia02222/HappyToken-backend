import { CorporateService } from '../modules/corporate/corporate.service';
import { DatabaseService } from '../database/database.service';
import { ContactsService } from '../modules/contacts/contacts.service';
import { SubsidiariesService } from '../modules/subsidiaries/subsidiaries.service';
export declare class SeedService {
    private readonly corporateService;
    private readonly dbService;
    private readonly contactsService;
    private readonly subsidiariesService;
    constructor(corporateService: CorporateService, dbService: DatabaseService, contactsService: ContactsService, subsidiariesService: SubsidiariesService);
    seedDatabase(): Promise<void>;
}
