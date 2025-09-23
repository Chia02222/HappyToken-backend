import { PartialType } from '@nestjs/mapped-types';

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
