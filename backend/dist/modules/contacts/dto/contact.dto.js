"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContactSchema = exports.createContactSchema = exports.UpdateContactDto = exports.CreateContactDto = exports.BaseContactDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const zod_1 = require("zod");
class BaseContactDto {
    corporate_uuid;
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
exports.createContactSchema = zod_1.z.object({
    corporate_uuid: zod_1.z.string().uuid().optional(),
    corporate_id: zod_1.z.number().int().positive().optional(),
    salutation: zod_1.z.string().min(1),
    first_name: zod_1.z.string().min(1),
    last_name: zod_1.z.string().min(1),
    contact_number: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    company_role: zod_1.z.string().min(1),
    system_role: zod_1.z.string().min(1),
}).refine((d) => Boolean(d.corporate_uuid || d.corporate_id), {
    message: 'Either corporate_uuid or corporate_id is required',
    path: ['corporate_uuid'],
});
exports.updateContactSchema = exports.createContactSchema.partial().extend({
    id: zod_1.z.number().int().positive().optional(),
});
//# sourceMappingURL=contact.dto.js.map