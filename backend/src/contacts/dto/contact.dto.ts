import { PartialType } from '@nestjs/mapped-types';

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
    id?: string;
}
