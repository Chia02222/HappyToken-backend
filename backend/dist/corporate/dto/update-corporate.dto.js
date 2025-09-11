"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCorporateDto = exports.UpdateSubsidiaryDto = exports.UpdateContactDto = exports.CreateSubsidiaryDto = exports.CreateContactDto = exports.CreateCorporateDto = exports.BaseSubsidiaryDto = exports.BaseContactDto = exports.BaseCorporateDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
class BaseCorporateDto {
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
exports.BaseCorporateDto = BaseCorporateDto;
class BaseContactDto {
    salutation;
    first_name;
    last_name;
    contact_number;
    email;
    company_role;
    system_role;
}
exports.BaseContactDto = BaseContactDto;
class BaseSubsidiaryDto {
    company_name;
    reg_number;
    office_address1;
    office_address2;
    postcode;
    city;
    state;
    country;
    website;
    account_note;
}
exports.BaseSubsidiaryDto = BaseSubsidiaryDto;
class CreateCorporateDto extends BaseCorporateDto {
}
exports.CreateCorporateDto = CreateCorporateDto;
class CreateContactDto extends BaseContactDto {
}
exports.CreateContactDto = CreateContactDto;
class CreateSubsidiaryDto extends BaseSubsidiaryDto {
}
exports.CreateSubsidiaryDto = CreateSubsidiaryDto;
class UpdateContactDto extends (0, mapped_types_1.PartialType)(BaseContactDto) {
    id;
}
exports.UpdateContactDto = UpdateContactDto;
class UpdateSubsidiaryDto extends (0, mapped_types_1.PartialType)(BaseSubsidiaryDto) {
    id;
}
exports.UpdateSubsidiaryDto = UpdateSubsidiaryDto;
class UpdateCorporateDto extends (0, mapped_types_1.PartialType)(CreateCorporateDto) {
    contacts;
    subsidiaries;
    contactIdsToDelete;
    subsidiaryIdsToDelete;
}
exports.UpdateCorporateDto = UpdateCorporateDto;
//# sourceMappingURL=update-corporate.dto.js.map