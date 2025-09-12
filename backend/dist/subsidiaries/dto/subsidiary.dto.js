"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSubsidiaryDto = exports.CreateSubsidiaryDto = exports.BaseSubsidiaryDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
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
    corporate_id;
}
exports.BaseSubsidiaryDto = BaseSubsidiaryDto;
class CreateSubsidiaryDto extends BaseSubsidiaryDto {
}
exports.CreateSubsidiaryDto = CreateSubsidiaryDto;
class UpdateSubsidiaryDto extends (0, mapped_types_1.PartialType)(BaseSubsidiaryDto) {
    id;
}
exports.UpdateSubsidiaryDto = UpdateSubsidiaryDto;
//# sourceMappingURL=subsidiary.dto.js.map