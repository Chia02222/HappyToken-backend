import { CorporateService } from '../corporate/corporate.service';
export declare class SeedService {
    private readonly corporateService;
    constructor(corporateService: CorporateService);
    seedDatabase(): Promise<void>;
}
