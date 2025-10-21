export declare class ResendService {
    private corporateService;
    constructor();
    sendCustomEmail(to: string, subject: string, html: string): Promise<{
        success: boolean;
        message: any;
    }>;
    sendEcommericialTermlink(id: string, approver?: 'first' | 'second'): Promise<{
        success: boolean;
        message: any;
    }>;
    sendAmendmentRequestEmail(corporateId: string): Promise<{
        success: boolean;
        message: any;
    }>;
    sendRejectEmail(corporateId: string, note?: string): Promise<{
        success: boolean;
        message: any;
    }>;
    sendAmendRejectEmail(corporateId: string, note?: string): Promise<{
        success: boolean;
        message: any;
    }>;
    sendExpiredEmail(corporateId: string, note?: string): Promise<{
        success: boolean;
        message: any;
    }>;
    sendAccountCreatedSuccessEmail(corporateId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
