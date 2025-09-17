"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCorporateDto = exports.CreateCorporateWithRelationsDto = exports.CreateCorporateDto = exports.SecondaryApproverDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
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
    investigation_log;
}
exports.CreateCorporateWithRelationsDto = CreateCorporateWithRelationsDto;
class UpdateCorporateDto extends (0, mapped_types_1.PartialType)(CreateCorporateDto) {
    id;
    contacts;
    subsidiaries;
    contactIdsToDelete;
    subsidiaryIdsToDelete;
    investigation_log;
    secondary_approver;
}
exports.UpdateCorporateDto = UpdateCorporateDto;
//# sourceMappingURL=corporate.dto.js.map