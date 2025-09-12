import { CorporateStatus } from '../../database/types';
export declare class BaseCorporateDto {
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
    billing_address1?: string | null;
    billing_address2?: string | null;
    billing_postcode?: string | null;
    billing_city?: string | null;
    billing_state?: string | null;
    billing_country?: string | null;
    company_tin?: string | null;
    sst_number?: string | null;
    agreement_from?: string | null;
    agreement_to?: string | null;
    credit_limit?: string | null;
    credit_terms?: string | null;
    transaction_fee?: string | null;
    late_payment_interest?: string | null;
    white_labeling_fee?: string | null;
    custom_feature_fee?: string | null;
    agreed_to_generic_terms: boolean;
    agreed_to_commercial_terms: boolean;
    first_approval_confirmation: boolean;
    second_approval_confirmation: boolean;
}
export declare class BaseContactDto {
    salutation: string;
    first_name: string;
    last_name: string;
    contact_number: string;
    email: string;
    company_role: string;
    system_role: string;
}
export declare class BaseSubsidiaryDto {
    company_name: string;
    reg_number: string;
    office_address1: string;
    office_address2?: string | null;
    postcode: string;
    city: string;
    state: string;
    country: string;
    website?: string | null;
    account_note?: string | null;
}
export declare class CreateCorporateDto extends BaseCorporateDto {
}
export declare class CreateContactDto extends BaseContactDto {
}
export declare class CreateSubsidiaryDto extends BaseSubsidiaryDto {
}
declare const UpdateContactDto_base: import("@nestjs/mapped-types").MappedType<Partial<BaseContactDto>>;
export declare class UpdateContactDto extends UpdateContactDto_base {
    id?: number;
}
declare const UpdateSubsidiaryDto_base: import("@nestjs/mapped-types").MappedType<Partial<BaseSubsidiaryDto>>;
export declare class UpdateSubsidiaryDto extends UpdateSubsidiaryDto_base {
    id?: number;
}
declare const UpdateCorporateDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateCorporateDto>>;
export declare class UpdateCorporateDto extends UpdateCorporateDto_base {
    contacts?: UpdateContactDto[];
    subsidiaries?: UpdateSubsidiaryDto[];
    contactIdsToDelete?: number[];
    subsidiaryIdsToDelete?: number[];
    investigation_log?: any;
}
export {};
