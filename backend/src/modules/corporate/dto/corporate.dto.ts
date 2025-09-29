import { CorporateStatus } from '../../../database/types';
import { PartialType } from '@nestjs/mapped-types';
import { CreateContactDto, UpdateContactDto} from '../../contacts/dto/contact.dto';
import { CreateSubsidiaryDto, UpdateSubsidiaryDto } from '../../subsidiaries/dto/subsidiary.dto';
import { z } from 'zod';

export class SecondaryApproverDto {
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

export class CreateCorporateDto {
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

export class CreateCorporateWithRelationsDto extends CreateCorporateDto {
  contacts?: CreateContactDto[];
  subsidiaries?: CreateSubsidiaryDto[];
  secondary_approver?: SecondaryApproverDto;
}

export class UpdateCorporateDto extends PartialType(CreateCorporateDto) {
    id?: string;
    contacts?: UpdateContactDto[];
    subsidiaries?: UpdateSubsidiaryDto[];
    contactIdsToDelete?: string[];
    subsidiaryIdsToDelete?: string[];
    secondary_approver?: SecondaryApproverDto; 
}

export const secondaryApproverSchema = z.object({
  use_existing_contact: z.boolean().optional(),
  selected_contact_id: z.union([z.string(), z.number()]).optional(),
  salutation: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  company_role: z.string().optional(),
  system_role: z.string().optional(),
  email: z.string().email().optional(),
  contact_number: z.string().optional(),
});

export const createCorporateSchema = z.object({
  company_name: z.string().min(1),
  reg_number: z.string().min(1),
  status: z.string().min(1),
  office_address1: z.string().min(1),
  office_address2: z.string().nullable().optional(),
  postcode: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  website: z.preprocess((v) => {
    if (typeof v === 'string') {
      const trimmed = v.trim();
      if (trimmed === '' || trimmed.toUpperCase() === 'N/A') return null;
      return trimmed;
    }
    return v;
  }, z.string().url().nullable().optional()),
  account_note: z.string().nullable().optional(),
  billing_same_as_official: z.boolean(),
  billing_address1: z.string(),
  billing_address2: z.string(),
  billing_postcode: z.string(),
  billing_city: z.string(),
  billing_state: z.string(),
  billing_country: z.string(),
  company_tin: z.string(),
  sst_number: z.string(),
  agreement_from: z.string().nullable().optional(),
  agreement_to: z.string().nullable().optional(),
  credit_limit: z.string(),
  credit_terms: z.string(),
  transaction_fee: z.string(),
  late_payment_interest: z.string(),
  white_labeling_fee: z.string(),
  custom_feature_fee: z.string(),
  agreed_to_generic_terms: z.boolean(),
  agreed_to_commercial_terms: z.boolean(),
  first_approval_confirmation: z.boolean(),
  second_approval_confirmation: z.boolean(),
  contacts: z.preprocess((v) => (Array.isArray(v) ? v : []), z.array(z.any()).optional()),
  subsidiaries: z.preprocess((v) => (Array.isArray(v) ? v : []), z.array(z.any()).optional()),
  secondary_approver: z.preprocess(
    (v) => (v && typeof v === 'object' ? v : undefined),
    secondaryApproverSchema.optional()
  ),
}).passthrough();

export const updateCorporateSchema = createCorporateSchema.partial().extend({
  id: z.union([z.string(), z.number()]).optional(),
  contactIdsToDelete: z.array(z.union([z.string(), z.number()])).optional(),
  subsidiaryIdsToDelete: z.array(z.union([z.string(), z.number()])).optional(),
}).passthrough();

export const updateStatusSchema = z.object({
  status: z.string().min(1),
  note: z.string().optional(),
});

export const investigationLogSchema = z.object({
  timestamp: z.string().min(1),
  note: z.string().nullable().optional(),
  from_status: z.string().nullable().optional(),
  to_status: z.string().nullable().optional(),
});