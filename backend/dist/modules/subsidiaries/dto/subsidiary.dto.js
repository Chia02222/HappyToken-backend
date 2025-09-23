"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubsidiarySchema = exports.createSubsidiarySchema = exports.UpdateSubsidiaryDto = exports.CreateSubsidiaryDto = exports.BaseSubsidiaryDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const zod_1 = require("zod");
class BaseSubsidiaryDto {
    corporate_id;
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
class CreateSubsidiaryDto extends BaseSubsidiaryDto {
}
exports.CreateSubsidiaryDto = CreateSubsidiaryDto;
class UpdateSubsidiaryDto extends (0, mapped_types_1.PartialType)(BaseSubsidiaryDto) {
    id;
}
exports.UpdateSubsidiaryDto = UpdateSubsidiaryDto;
exports.createSubsidiarySchema = zod_1.z.object({
    corporate_id: zod_1.z.number().int().positive(),
    company_name: zod_1.z.string().min(1),
    reg_number: zod_1.z.string().min(1),
    office_address1: zod_1.z.string().min(1),
    office_address2: zod_1.z.string().nullable().optional(),
    postcode: zod_1.z.string().min(1),
    city: zod_1.z.string().min(1),
    state: zod_1.z.string().min(1),
    country: zod_1.z.string().min(1),
    website: zod_1.z.string().url().nullable().optional(),
    account_note: zod_1.z.string().nullable().optional(),
});
exports.updateSubsidiarySchema = exports.createSubsidiarySchema.partial().extend({
    id: zod_1.z.number().int().positive().optional(),
});
//# sourceMappingURL=subsidiary.dto.js.map