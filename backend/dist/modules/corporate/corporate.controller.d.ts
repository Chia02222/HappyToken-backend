import { CorporateService } from './corporate.service';
import { ResendService } from '../resend/resend.service';
import { PdfService } from './pdf.service';
import { InvestigationLogTable } from '../../database/types';
import { CreateCorporateWithRelationsDto, UpdateCorporateDto } from './dto/corporate.dto';
export declare class CorporateController {
    private readonly corporateService;
    private readonly resendService;
    private readonly pdfService;
    constructor(corporateService: CorporateService, resendService: ResendService, pdfService: PdfService);
    findAll(): Promise<{
        uuid: string;
        company_name: string;
        reg_number: string;
        status: import("../../database/types").CorporateStatus;
        office_address1: string;
        office_address2: string | null;
        postcode: string;
        city: string;
        state: string;
        country: string;
        website: string | null;
        account_note: string | null;
        billing_same_as_official: boolean;
        billing_address1: string;
        billing_address2: string;
        billing_postcode: string;
        billing_city: string;
        billing_state: string;
        billing_country: string;
        company_tin: string;
        sst_number: string;
        agreement_from: string | null;
        agreement_to: string | null;
        credit_limit: string;
        credit_terms: string;
        transaction_fee: string;
        late_payment_interest: string;
        white_labeling_fee: string;
        custom_feature_fee: string;
        agreed_to_generic_terms: boolean;
        agreed_to_commercial_terms: boolean;
        first_approval_confirmation: boolean;
        second_approval_confirmation: boolean | null;
        cooling_period_start: string | null;
        cooling_period_end: string | null;
        secondary_approver_uuid: string | null;
        pinned: boolean;
        created_at: string;
        updated_at: string;
    }[]>;
    findById(id: string): Promise<any>;
    getCorporatePdf(id: string, res: any): Promise<void>;
    create(corporateData: CreateCorporateWithRelationsDto & {
        investigation_log?: InvestigationLogTable;
        id?: string;
    }): Promise<any>;
    update(id: string, updateData: UpdateCorporateDto): Promise<any>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
    addInvestigationLog(corporateId: string, logData: Omit<InvestigationLogTable, 'id' | 'corporate_id' | 'created_at'>): Promise<any>;
    updateStatus(id: string, body: {
        status: string;
        note?: string;
    }): Promise<any>;
    createAmendmentRequest(corporateId: string, amendmentData: {
        requestedChanges: string;
        amendmentReason: string;
        submittedBy: string;
        originalData: any;
        amendedData: any;
    }): Promise<{
        success: boolean;
        message: string;
        amendmentId: any;
    }>;
    updateAmendmentStatus(corporateId: string, amendmentId: string, body: {
        status: 'approved' | 'rejected';
        reviewNotes?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getAmendmentRequests(corporateId?: string): Promise<{
        uuid: string;
        created_at: string;
        corporate_uuid: string;
        timestamp: string;
        note: string | null;
        from_status: import("../../database/types").CorporateStatus | null;
        to_status: import("../../database/types").CorporateStatus | null;
        amendment_data: any;
    }[]>;
    getAmendmentRequestsByCorporate(id: string): Promise<{
        uuid: string;
        created_at: string;
        corporate_uuid: string;
        timestamp: string;
        note: string | null;
        from_status: import("../../database/types").CorporateStatus | null;
        to_status: import("../../database/types").CorporateStatus | null;
        amendment_data: any;
    }[]>;
    getAmendmentById(amendmentId: string): Promise<{
        uuid: string;
        created_at: string;
        corporate_uuid: string;
        timestamp: string;
        note: string | null;
        from_status: import("../../database/types").CorporateStatus | null;
        to_status: import("../../database/types").CorporateStatus | null;
        amendment_data: any;
    } | undefined>;
    submitForFirstApproval(id: string): Promise<void>;
    sendEcommericialTermlink(id: string, approver?: 'first' | 'second'): Promise<{
        success: boolean;
        message: any;
    }>;
    completeCoolingPeriod(id: string): Promise<any>;
    sendAmendmentEmail(id: string): Promise<{
        success: boolean;
        message: any;
    }>;
    sendAmendRejectEmail(id: string, body: {
        note?: string;
    }): Promise<{
        success: boolean;
        message: any;
    }>;
    updatePinnedStatus(id: string, body: {
        pinned: boolean;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
