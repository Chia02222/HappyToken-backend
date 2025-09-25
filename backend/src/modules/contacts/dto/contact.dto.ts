import { PartialType } from '@nestjs/mapped-types';
import { z, type ZodObject, type ZodRawShape } from 'zod';

// Base DTO that explicitly defines properties from the `contacts` table
export class BaseContactDto {
    corporate_id: number;
    salutation: string;
    first_name: string;
    last_name: string;
    contact_number: string;
    email: string;
    company_role: string;
    system_role: string;
}

// DTO for creating a contact
export class CreateContactDto extends BaseContactDto {}

// DTO for updating a contact, including an optional ID
export class UpdateContactDto extends PartialType(BaseContactDto) {
    id?: number;
}

export const createContactSchema = z.object({
    corporate_id: z.number().int().positive(),
    salutation: z.string().min(1),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    contact_number: z.string().min(1),
    email: z.string().email(),
    company_role: z.string().min(1),
    system_role: z.string().min(1),
}) as ZodObject<ZodRawShape>;

export const updateContactSchema = (createContactSchema as ZodObject<ZodRawShape>).partial().extend({
    id: z.number().int().positive().optional(),
});
