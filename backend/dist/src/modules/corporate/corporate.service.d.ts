import { InvestigationLogTable, CorporateStatus } from '../../database/types';
import { CreateCorporateWithRelationsDto, UpdateCorporateDto } from './dto/corporate.dto';
export declare class CorporateService {
    private dbService;
    private contactsService;
    private subsidiariesService;
    private resendService;
    constructor();
    private get db();
    private isValidUUID;
    private formatDateToString;
    private processCorporateDates;
    findAll(): Promise<{
        uuid: string;
        company_name: string;
        reg_number: string;
        status: CorporateStatus;
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
    create(corporateData: Omit<CreateCorporateWithRelationsDto, 'investigation_log'>): Promise<any>;
    update(id: string, updateData: UpdateCorporateDto): Promise<any>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
    addInvestigationLog(corporateId: string, logData: Omit<InvestigationLogTable, 'uuid' | 'corporate_uuid' | 'created_at' | 'id' | 'corporate_id'>): Promise<any>;
    getInvestigationLogs(corporateId: string): Promise<{
        uuid: string;
        created_at: string;
        corporate_uuid: string;
        timestamp: string;
        note: string | null;
        from_status: CorporateStatus | null;
        to_status: CorporateStatus | null;
        amendment_data: any;
    }[]>;
    updateStatus(id: string, status: string, note?: string): Promise<any>;
    handleCoolingPeriodCompletion(corporateId: string): Promise<any>;
    expireStaleCorporatesDaily(): Promise<void>;
    createAmendmentRequest(corporateId: string, amendmentData: any): Promise<{
        success: boolean;
        message: string;
        amendmentId: any;
    }>;
    updateAmendmentStatus(corporateId: string, amendmentId: string, status: 'approved' | 'rejected', reviewNotes?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getAmendmentRequests(corporateId?: string): Promise<{
        uuid: string;
        created_at: string;
        corporate_uuid: string;
        timestamp: string;
        note: string | null;
        from_status: CorporateStatus | null;
        to_status: CorporateStatus | null;
        amendment_data: any;
    }[]>;
    getAmendmentById(amendmentId: string): Promise<{
        uuid: string;
        created_at: string;
        corporate_uuid: string;
        timestamp: string;
        note: string | null;
        from_status: CorporateStatus | null;
        to_status: CorporateStatus | null;
        amendment_data: any;
    } | undefined>;
    updatePinnedStatus(corporateId: string, pinned: boolean): Promise<{
        success: boolean;
        message: string;
    }>;
}
