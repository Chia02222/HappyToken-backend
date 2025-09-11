import { CorporateService } from '../corporate/corporate.service';
import { DatabaseService } from '../database/database.service';
export declare class SeedService {
    private readonly corporateService;
    private readonly dbService;
    constructor(corporateService: CorporateService, dbService: DatabaseService);
    seedDatabase(): Promise<void>;
}
