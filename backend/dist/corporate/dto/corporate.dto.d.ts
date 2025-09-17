import { CorporateStatus, InvestigationLogTable } from '../../database/types';
import { CreateContactDto, UpdateContactDto } from '../../contacts/dto/contact.dto';
import { CreateSubsidiaryDto, UpdateSubsidiaryDto } from '../../subsidiaries/dto/subsidiary.dto';
export declare class SecondaryApproverDto {
    use_existing_contact?: boolean;
    selected_contact_id?: string;
    salutation?: string;
    first_name?: string;
    last_name?: string;
    company_role?: string;
    system_role?: string;
    email?: string;
    contact_number?: string;
}
export declare class CreateCorporateDto {
    company_name: string;
    reg_number: string;
    status: CorporateStatus;
    office_address1: string;
    office_address2?: string | null;
    postcode: string;
    city: string;
    state: string;
    country: string;
    website?: string | null;
    account_note?: string | null;
    billing_same_as_official: boolean;
    billing_address1: string;
    billing_address2: string;
    billing_postcode: string;
    billing_city: string;
    billing_state: string;
    billing_country: string;
    company_tin: string;
    sst_number: string;
    agreement_from?: string | null;
    agreement_to?: string | null;
    credit_limit: string;
    credit_terms: string;
    transaction_fee: string;
    late_payment_interest: string;
    white_labeling_fee: string;
    custom_feature_fee: string;
    agreed_to_generic_terms: boolean;
    agreed_to_commercial_terms: boolean;
    first_approval_confirmation: boolean;
    second_approval_confirmation: boolean;
}
export declare class CreateCorporateWithRelationsDto extends CreateCorporateDto {
    contacts?: CreateContactDto[];
    subsidiaries?: CreateSubsidiaryDto[];
    investigation_log?: InvestigationLogTable[];
    secondary_approver?: SecondaryApproverDto;
}
declare const UpdateCorporateDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateCorporateDto>>;
export declare class UpdateCorporateDto extends UpdateCorporateDto_base {
    id?: string;
    contacts?: UpdateContactDto[];
    subsidiaries?: UpdateSubsidiaryDto[];
    contactIdsToDelete?: string[];
    subsidiaryIdsToDelete?: string[];
    investigation_log?: InvestigationLogTable[];
    secondary_approver?: SecondaryApproverDto;
}
export {};
