import { DatabaseService } from '../database/database.service';
import { SubsidiaryTable } from '../database/types';
export declare class SubsidiariesService {
    private readonly dbService;
    constructor(dbService: DatabaseService);
    private get db();
    findAll(params?: {
        corporate_id?: number;
        limit?: number;
        offset?: number;
    }): Promise<{
        id: number;
        company_name: string;
        reg_number: string;
        office_address1: string;
        office_address2: string;
        postcode: string;
        city: string;
        state: string;
        country: string;
        website: string;
        account_note: string;
        created_at: string;
        updated_at: string;
        corporate_id: number;
    }[]>;
    findById(id: number): Promise<{
        id: number;
        company_name: string;
        reg_number: string;
        office_address1: string;
        office_address2: string;
        postcode: string;
        city: string;
        state: string;
        country: string;
        website: string;
        account_note: string;
        created_at: string;
        updated_at: string;
        corporate_id: number;
    }>;
    create(data: Omit<SubsidiaryTable, 'id' | 'created_at' | 'updated_at'>): Promise<{
        id: number;
        company_name: string;
        reg_number: string;
        office_address1: string;
        office_address2: string;
        postcode: string;
        city: string;
        state: string;
        country: string;
        website: string;
        account_note: string;
        created_at: string;
        updated_at: string;
        corporate_id: number;
    }>;
    update(id: number, data: Partial<Omit<SubsidiaryTable, 'id' | 'created_at'>>): Promise<{
        id: number;
        company_name: string;
        reg_number: string;
        office_address1: string;
        office_address2: string;
        postcode: string;
        city: string;
        state: string;
        country: string;
        website: string;
        account_note: string;
        created_at: string;
        updated_at: string;
        corporate_id: number;
    }>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
}
