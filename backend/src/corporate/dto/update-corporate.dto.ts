import { PartialType } from '@nestjs/mapped-types';
import { CorporateStatus } from '../../database/types';

// Base DTOs that explicitly define properties from the database tables
// These will be used for creation and as a base for update DTOs

export class BaseCorporateDto {
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

export class BaseContactDto {
    salutation: string;
    first_name: string;
    last_name: string;
    contact_number: string;
    email: string;
    company_role: string;
    system_role: string;
}

export class BaseSubsidiaryDto {
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

// DTOs for creation
export class CreateCorporateDto extends BaseCorporateDto {}
export class CreateContactDto extends BaseContactDto {}
export class CreateSubsidiaryDto extends BaseSubsidiaryDto {}

// DTOs for updates
export class UpdateContactDto extends PartialType(BaseContactDto) {
    id?: number; // Optional ID for existing contacts
}

export class UpdateSubsidiaryDto extends PartialType(BaseSubsidiaryDto) {
    id?: number; // Optional ID for existing subsidiaries
}

export class UpdateCorporateDto extends PartialType(CreateCorporateDto) {
    contacts?: UpdateContactDto[];
    subsidiaries?: UpdateSubsidiaryDto[];
    contactIdsToDelete?: number[];
    subsidiaryIdsToDelete?: number[];
}