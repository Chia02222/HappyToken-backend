import { CreateSubsidiaryDto, UpdateSubsidiaryDto } from './dto/subsidiary.dto';
export declare class SubsidiariesService {
    private dbService;
    constructor();
    private get db();
    addSubsidiary(subsidiaryData: CreateSubsidiaryDto | (CreateSubsidiaryDto & {
        corporate_uuid?: string;
    })): Promise<{
        uuid: string;
        company_name: string;
        reg_number: string;
        office_address1: string;
        office_address2: string | null;
        postcode: string;
        city: string;
        state: string;
        country: string;
        website: string | null;
        account_note: string | null;
        created_at: string;
        updated_at: string;
        corporate_uuid: string;
    }>;
    updateSubsidiary(uuid: string, subsidiaryData: UpdateSubsidiaryDto): Promise<{
        uuid: string;
        company_name: string;
        reg_number: string;
        office_address1: string;
        office_address2: string | null;
        postcode: string;
        city: string;
        state: string;
        country: string;
        website: string | null;
        account_note: string | null;
        created_at: string;
        updated_at: string;
        corporate_uuid: string;
    }>;
    deleteSubsidiary(uuid: string): Promise<{
        success: boolean;
    }>;
    findAll(): Promise<{
        uuid: string;
        company_name: string;
        reg_number: string;
        office_address1: string;
        office_address2: string | null;
        postcode: string;
        city: string;
        state: string;
        country: string;
        website: string | null;
        account_note: string | null;
        created_at: string;
        updated_at: string;
        corporate_uuid: string;
    }[]>;
    findById(uuid: string): Promise<{
        uuid: string;
        company_name: string;
        reg_number: string;
        office_address1: string;
        office_address2: string | null;
        postcode: string;
        city: string;
        state: string;
        country: string;
        website: string | null;
        account_note: string | null;
        created_at: string;
        updated_at: string;
        corporate_uuid: string;
    } | undefined>;
}
