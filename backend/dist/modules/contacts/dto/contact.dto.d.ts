import { z, ZodObject } from 'zod';
export declare class BaseContactDto {
    corporate_id: number;
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
declare const UpdateContactDto_base: import("@nestjs/mapped-types").MappedType<Partial<BaseContactDto>>;
export declare class UpdateContactDto extends UpdateContactDto_base {
    id?: number;
}
export declare const createContactSchema: ZodObject<any>;
export declare const updateContactSchema: z.ZodObject<{
    [x: string]: z.ZodOptional<any>;
    id: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export {};
