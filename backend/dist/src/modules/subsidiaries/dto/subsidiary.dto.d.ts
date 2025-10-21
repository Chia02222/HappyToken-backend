import { z } from 'zod';
export declare class BaseSubsidiaryDto {
    corporate_uuid?: string;
    corporate_id?: number;
    company_name: string;
    reg_number: string;
    office_address1: string;
    office_address2?: string | null;
    postcode: string;
    city: string;
    state: string;
    country: string;
    website?: string | null;
    account_note?: string | null;
}
export declare class CreateSubsidiaryDto extends BaseSubsidiaryDto {
}
export declare class UpdateSubsidiaryDto extends BaseSubsidiaryDto {
    id?: number;
}
export declare const createSubsidiarySchema: z.ZodObject<{
    corporate_uuid: z.ZodOptional<z.ZodString>;
    corporate_id: z.ZodOptional<z.ZodNumber>;
    company_name: z.ZodString;
    reg_number: z.ZodString;
    office_address1: z.ZodString;
    office_address2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    postcode: z.ZodString;
    city: z.ZodString;
    state: z.ZodString;
    country: z.ZodString;
    website: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    account_note: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const updateSubsidiarySchema: z.ZodObject<{
    corporate_uuid: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    corporate_id: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    company_name: z.ZodOptional<z.ZodString>;
    reg_number: z.ZodOptional<z.ZodString>;
    office_address1: z.ZodOptional<z.ZodString>;
    office_address2: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    postcode: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    account_note: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    id: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
