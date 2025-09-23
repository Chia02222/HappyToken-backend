"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.investigationLogSchema = exports.updateStatusSchema = exports.updateCorporateSchema = exports.createCorporateSchema = exports.secondaryApproverSchema = exports.UpdateCorporateDto = exports.CreateCorporateWithRelationsDto = exports.CreateCorporateDto = exports.SecondaryApproverDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const zod_1 = require("zod");
class SecondaryApproverDto {
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
exports.SecondaryApproverDto = SecondaryApproverDto;
class CreateCorporateDto {
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
exports.CreateCorporateDto = CreateCorporateDto;
class CreateCorporateWithRelationsDto extends CreateCorporateDto {
    contacts;
    subsidiaries;
    secondary_approver;
}
exports.CreateCorporateWithRelationsDto = CreateCorporateWithRelationsDto;
class UpdateCorporateDto extends (0, mapped_types_1.PartialType)(CreateCorporateDto) {
    id;
    contacts;
    subsidiaries;
    contactIdsToDelete;
    subsidiaryIdsToDelete;
    secondary_approver;
}
exports.UpdateCorporateDto = UpdateCorporateDto;
exports.secondaryApproverSchema = zod_1.z.object({
    use_existing_contact: zod_1.z.boolean().optional(),
    selected_contact_id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
    salutation: zod_1.z.string().optional(),
    first_name: zod_1.z.string().optional(),
    last_name: zod_1.z.string().optional(),
    company_role: zod_1.z.string().optional(),
    system_role: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    contact_number: zod_1.z.string().optional(),
});
exports.createCorporateSchema = zod_1.z.object({
    company_name: zod_1.z.string().min(1),
    reg_number: zod_1.z.string().min(1),
    status: zod_1.z.string().min(1),
    office_address1: zod_1.z.string().min(1),
    office_address2: zod_1.z.string().nullable().optional(),
    postcode: zod_1.z.string().min(1),
    city: zod_1.z.string().min(1),
    state: zod_1.z.string().min(1),
    country: zod_1.z.string().min(1),
    website: zod_1.z.preprocess((v) => (v === '' ? null : v), zod_1.z.string().url().nullable().optional()),
    account_note: zod_1.z.string().nullable().optional(),
    billing_same_as_official: zod_1.z.boolean(),
    billing_address1: zod_1.z.string(),
    billing_address2: zod_1.z.string(),
    billing_postcode: zod_1.z.string(),
    billing_city: zod_1.z.string(),
    billing_state: zod_1.z.string(),
    billing_country: zod_1.z.string(),
    company_tin: zod_1.z.string(),
    sst_number: zod_1.z.string(),
    agreement_from: zod_1.z.string().nullable().optional(),
    agreement_to: zod_1.z.string().nullable().optional(),
    credit_limit: zod_1.z.string(),
    credit_terms: zod_1.z.string(),
    transaction_fee: zod_1.z.string(),
    late_payment_interest: zod_1.z.string(),
    white_labeling_fee: zod_1.z.string(),
    custom_feature_fee: zod_1.z.string(),
    agreed_to_generic_terms: zod_1.z.boolean(),
    agreed_to_commercial_terms: zod_1.z.boolean(),
    first_approval_confirmation: zod_1.z.boolean(),
    second_approval_confirmation: zod_1.z.boolean(),
    contacts: zod_1.z.preprocess((v) => (Array.isArray(v) ? v : []), zod_1.z.array(zod_1.z.any()).optional()),
    subsidiaries: zod_1.z.preprocess((v) => (Array.isArray(v) ? v : []), zod_1.z.array(zod_1.z.any()).optional()),
    secondary_approver: zod_1.z.preprocess((v) => (v && typeof v === 'object' ? v : undefined), exports.secondaryApproverSchema.optional()),
}).passthrough();
exports.updateCorporateSchema = exports.createCorporateSchema.partial().extend({
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
    contactIdsToDelete: zod_1.z.array(zod_1.z.union([zod_1.z.string(), zod_1.z.number()])).optional(),
    subsidiaryIdsToDelete: zod_1.z.array(zod_1.z.union([zod_1.z.string(), zod_1.z.number()])).optional(),
}).passthrough();
exports.updateStatusSchema = zod_1.z.object({
    status: zod_1.z.string().min(1),
    note: zod_1.z.string().optional(),
});
exports.investigationLogSchema = zod_1.z.object({
    timestamp: zod_1.z.string().min(1),
    note: zod_1.z.string().nullable().optional(),
    from_status: zod_1.z.string().nullable().optional(),
    to_status: zod_1.z.string().nullable().optional(),
});
//# sourceMappingURL=corporate.dto.js.map