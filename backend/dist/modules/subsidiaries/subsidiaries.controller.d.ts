import { SubsidiariesService } from './subsidiaries.service';
import { CreateSubsidiaryDto, UpdateSubsidiaryDto } from './dto/subsidiary.dto';
export declare class SubsidiariesController {
    private readonly subsidiariesService;
    constructor(subsidiariesService: SubsidiariesService);
    addSubsidiary(corporateUuid: string, subsidiaryData: Omit<CreateSubsidiaryDto, 'corporate_id'>): Promise<{
        corporate_uuid: string;
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
        uuid: string;
        created_at: string;
        updated_at: string;
    }>;
    updateSubsidiary(uuid: string, subsidiaryData: UpdateSubsidiaryDto): Promise<{
        corporate_uuid: string;
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
        uuid: string;
        created_at: string;
        updated_at: string;
    }>;
    deleteSubsidiary(uuid: string): Promise<{
        success: boolean;
    }>;
}
