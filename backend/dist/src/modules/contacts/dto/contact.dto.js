import { z } from 'zod';
export class BaseContactDto {
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
export class CreateContactDto extends BaseContactDto {
}
export class UpdateContactDto extends BaseContactDto {
    id;
}
export const createContactSchema = z.object({
    corporate_uuid: z.string().uuid().optional(),
    corporate_id: z.number().int().positive().optional(),
    salutation: z.string().min(1),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    contact_number: z.string().min(1),
    email: z.string().email(),
    company_role: z.string().min(1),
    system_role: z.string().min(1),
}).refine((d) => Boolean(d.corporate_uuid || d.corporate_id), {
    message: 'Either corporate_uuid or corporate_id is required',
    path: ['corporate_uuid'],
});
export const updateContactSchema = createContactSchema.partial().extend({
    id: z.number().int().positive().optional(),
});
//# sourceMappingURL=contact.dto.js.map