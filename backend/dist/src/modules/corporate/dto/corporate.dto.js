import { z } from 'zod';
export class SecondaryApproverDto {
    use_existing_contact;
    selected_contact_id;
    salutation;
    first_name;
    last_name;
    company_role;
    system_role;
    email;
    contact_number;
}
export class CreateCorporateDto {
    company_name;
    reg_number;
    status;
    office_address1;
    office_address2;
    postcode;
    city;
    state;
    country;
    website;
    account_note;
    billing_same_as_official;
    billing_address1;
    billing_address2;
    billing_postcode;
    billing_city;
    billing_state;
    billing_country;
    company_tin;
    sst_number;
    agreement_from;
    agreement_to;
    credit_limit;
    credit_terms;
    transaction_fee;
    late_payment_interest;
    white_labeling_fee;
    custom_feature_fee;
    agreed_to_generic_terms;
    agreed_to_commercial_terms;
    first_approval_confirmation;
    second_approval_confirmation;
}
export class CreateCorporateWithRelationsDto extends CreateCorporateDto {
    contacts;
    subsidiaries;
    secondary_approver;
}
export class UpdateCorporateDto extends CreateCorporateDto {
    id;
    contacts;
    subsidiaries;
    contactIdsToDelete;
    subsidiaryIdsToDelete;
    secondary_approver;
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
            if (trimmed === '' || trimmed.toUpperCase() === 'N/A')
                return null;
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
    secondary_approver: z.preprocess((v) => (v && typeof v === 'object' ? v : undefined), secondaryApproverSchema.optional()),
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
//# sourceMappingURL=corporate.dto.js.map