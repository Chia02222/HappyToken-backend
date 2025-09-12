export declare class BaseSubsidiaryDto {
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
    corporate_id: string;
}
export declare class CreateSubsidiaryDto extends BaseSubsidiaryDto {
}
declare const UpdateSubsidiaryDto_base: import("@nestjs/mapped-types").MappedType<Partial<BaseSubsidiaryDto>>;
export declare class UpdateSubsidiaryDto extends UpdateSubsidiaryDto_base {
    id?: string;
}
export {};
