import { CorporateService } from '../corporate/corporate.service';
export declare class ResendService {
    private readonly corporateService;
    constructor(corporateService: CorporateService);
    resendRegistrationLink(id: string): Promise<{
        success: boolean;
        message: any;
    }>;
}
