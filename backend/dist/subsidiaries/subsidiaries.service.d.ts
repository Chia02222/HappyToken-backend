import { DatabaseService } from '../database/database.service';
import { SubsidiaryTable } from '../database/types';
export declare class SubsidiariesService {
    private readonly dbService;
    constructor(dbService: DatabaseService);
    private get db();
    findAll(params?: {
        corporate_id?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        id: string;
        company_name: string;
        reg_number: string;
        office_address1: string;
        office_address2: string | null;
        postcode: string;
        city: string;
        state: string;
        country: string;
        website: string;
        account_note: string;
        created_at: string;
        updated_at: string;
        corporate_id: string;
    }[]>;
    findById(id: string): Promise<{
        id: string;
        company_name: string;
        reg_number: string;
        office_address1: string;
        office_address2: string | null;
        postcode: string;
        city: string;
        state: string;
        country: string;
        website: string;
        account_note: string;
        created_at: string;
        updated_at: string;
        corporate_id: string;
    }>;
    create(data: Omit<SubsidiaryTable, 'id' | 'created_at' | 'updated_at'>): Promise<{
        id: string;
        company_name: string;
        reg_number: string;
        office_address1: string;
        office_address2: string | null;
        postcode: string;
        city: string;
        state: string;
        country: string;
        website: string;
        account_note: string;
        created_at: string;
        updated_at: string;
        corporate_id: string;
    }>;
    update(id: string, data: Partial<Omit<SubsidiaryTable, 'id' | 'created_at'>>): Promise<{
        id: string;
        company_name: string;
        reg_number: string;
        office_address1: string;
        office_address2: string | null;
        postcode: string;
        city: string;
        state: string;
        country: string;
        website: string;
        account_note: string;
        created_at: string;
        updated_at: string;
        corporate_id: string;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
