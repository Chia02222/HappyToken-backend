import { z } from 'zod';
export class BaseSubsidiaryDto {
    corporate_uuid;
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
export class CreateSubsidiaryDto extends BaseSubsidiaryDto {
}
export class UpdateSubsidiaryDto extends BaseSubsidiaryDto {
    id;
}
export const createSubsidiarySchema = z.object({
    corporate_uuid: z.string().uuid().optional(),
    corporate_id: z.number().int().positive().optional(),
    company_name: z.string().min(1),
    reg_number: z.string().min(1),
    office_address1: z.string().min(1),
    office_address2: z.string().nullable().optional(),
    postcode: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    country: z.string().min(1),
    website: z.string().url().nullable().optional(),
    account_note: z.string().nullable().optional(),
}).refine((d) => Boolean(d.corporate_uuid || d.corporate_id), {
    message: 'Either corporate_uuid or corporate_id is required',
    path: ['corporate_uuid'],
});
export const updateSubsidiarySchema = createSubsidiarySchema.partial().extend({
    id: z.number().int().positive().optional(),
});
//# sourceMappingURL=subsidiary.dto.js.map