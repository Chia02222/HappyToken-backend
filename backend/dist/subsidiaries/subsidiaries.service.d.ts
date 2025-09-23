import { DatabaseService } from '../database/database.service';
import { CreateSubsidiaryDto, UpdateSubsidiaryDto } from './dto/subsidiary.dto';
export declare class SubsidiariesService {
    private readonly dbService;
    constructor(dbService: DatabaseService);
    private get db();
    addSubsidiary(subsidiaryData: CreateSubsidiaryDto): Promise<{
        id: number;
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
        corporate_id: number;
    }>;
    updateSubsidiary(id: number, subsidiaryData: UpdateSubsidiaryDto): Promise<{
        id: number;
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
        corporate_id: number;
    }>;
    deleteSubsidiary(id: number): Promise<{
        success: boolean;
    }>;
}
