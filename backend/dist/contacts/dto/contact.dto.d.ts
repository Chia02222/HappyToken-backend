export declare class BaseContactDto {
    corporate_id: string;
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
    id?: string;
}
export {};
