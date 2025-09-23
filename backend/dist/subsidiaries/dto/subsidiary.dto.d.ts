export declare class BaseSubsidiaryDto {
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
export declare class CreateSubsidiaryDto extends BaseSubsidiaryDto {
}
declare const UpdateSubsidiaryDto_base: import("@nestjs/mapped-types").MappedType<Partial<BaseSubsidiaryDto>>;
export declare class UpdateSubsidiaryDto extends UpdateSubsidiaryDto_base {
    id?: number;
}
export {};
