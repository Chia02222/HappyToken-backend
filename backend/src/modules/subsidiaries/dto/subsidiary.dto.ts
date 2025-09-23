import { PartialType } from '@nestjs/mapped-types';
import { z } from 'zod';

// Base DTO that explicitly defines properties from the `subsidiaries` table
export class BaseSubsidiaryDto {
    corporate_id: number;
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

// DTO for creating a subsidiary
export class CreateSubsidiaryDto extends BaseSubsidiaryDto {}

// DTO for updating a subsidiary, including an optional ID
export class UpdateSubsidiaryDto extends PartialType(BaseSubsidiaryDto) {
    id?: number;
}

export const createSubsidiarySchema = z.object({
    corporate_id: z.number().int().positive(),
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
});

export const updateSubsidiarySchema = createSubsidiarySchema.partial().extend({
    id: z.number().int().positive().optional(),
});
