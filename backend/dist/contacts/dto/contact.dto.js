"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateContactDto = exports.CreateContactDto = exports.BaseContactDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
class BaseContactDto {
    corporate_id;
    salutation;
    first_name;
    last_name;
    contact_number;
    email;
    company_role;
    system_role;
}
exports.BaseContactDto = BaseContactDto;
class CreateContactDto extends BaseContactDto {
}
exports.CreateContactDto = CreateContactDto;
class UpdateContactDto extends (0, mapped_types_1.PartialType)(BaseContactDto) {
    id;
}
exports.UpdateContactDto = UpdateContactDto;
//# sourceMappingURL=contact.dto.js.map