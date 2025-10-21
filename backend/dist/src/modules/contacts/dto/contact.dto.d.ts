import { z, type ZodObject, type ZodRawShape } from 'zod';
export declare class BaseContactDto {
    corporate_uuid?: string;
    corporate_id?: number;
    salutation: string;
    first_name: string;
    last_name: string;
    contact_number: string;
    email: string;
    company_role: string;
    system_role: string;
}
export declare class CreateContactDto extends BaseContactDto {
}
export declare class UpdateContactDto extends BaseContactDto {
    id?: number;
}
export declare const createContactSchema: ZodObject<ZodRawShape>;
export declare const updateContactSchema: z.ZodObject<{
    readonly [x: string]: z.ZodOptional<z.core.$ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>>;
    id: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
