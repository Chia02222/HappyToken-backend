import { CorporateService } from '../corporate/corporate.service';
export declare class ResendService {
    private readonly corporateService;
    constructor(corporateService: CorporateService);
    sendCustomEmail(to: string, subject: string, html: string): Promise<{
        success: boolean;
        message: any;
    }>;
    resendRegistrationLink(id: string): Promise<{
        success: boolean;
        message: any;
    }>;
}
