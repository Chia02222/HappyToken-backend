import { SubsidiariesService } from './subsidiaries.service';
import { CreateSubsidiaryDto, UpdateSubsidiaryDto } from './dto/subsidiary.dto';
export declare class SubsidiariesController {
    private readonly subsidiariesService;
    constructor(subsidiariesService: SubsidiariesService);
    addSubsidiary(corporateId: string, subsidiaryData: Omit<CreateSubsidiaryDto, 'corporate_id'>): Promise<{
        id: string;
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
        corporate_id: string;
    }>;
    updateSubsidiary(id: string, subsidiaryData: UpdateSubsidiaryDto): Promise<{
        id: string;
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
        corporate_id: string;
    }>;
    deleteSubsidiary(id: string): Promise<{
        success: boolean;
    }>;
}
