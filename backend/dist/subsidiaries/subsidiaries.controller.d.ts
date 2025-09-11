import { SubsidiariesService } from './subsidiaries.service';
import { SubsidiaryTable } from '../database/types';
export declare class SubsidiariesController {
    private readonly subsidiariesService;
    constructor(subsidiariesService: SubsidiariesService);
    findAll(corporateId?: string, limit?: string, offset?: string): Promise<{
        id: number;
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
        corporate_id: number;
    }[]>;
    findById(id: number): Promise<{
        id: number;
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
        corporate_id: number;
    }>;
    create(body: Omit<SubsidiaryTable, 'id' | 'created_at' | 'updated_at'>): Promise<{
        id: number;
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
        corporate_id: number;
    }>;
    update(id: number, body: Partial<Omit<SubsidiaryTable, 'id' | 'created_at'>>): Promise<{
        id: number;
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
        corporate_id: number;
    }>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
}
