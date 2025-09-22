
export type Page = 'Dashboard' | 'RFQ' | 'Merchant' | 'CRT Corporate' | 'API' | 'Configuration' | 'Management' | 'Reports';

export interface NavItem {
  name: Page;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  subItems?: string[];
}

export type CorporateStatus = 'New' | 'Sent' | 'Pending 1st Approval' | 'Pending 2nd Approval' | 'Approved' | 'Rejected' | 'Cooling Period' | 'Resolved' | 'Closed' | 'Reopened' | 'Pending Contract Setup' | 'Under Fraud Investigation';

export interface LogEntry {
  id: string;
  timestamp: string;
  note: string | null;
  from_status: CorporateStatus | null;
  to_status: CorporateStatus | null;
}

export interface Contact {
  id?: string;
  salutation: string;
  first_name: string;
  last_name: string;
  contact_number: string;
  email: string;
  company_role: string;
  system_role: string;
}

export interface Subsidiary {
    id?: string;
    company_name: string;
    reg_number: string;
    office_address1: string;
    office_address2?: string;
    postcode: string;
    city: string;
    state: string;
    country: string;
    website?: string;
    account_note?: string;
}

export interface Corporate {
  id: string;
  company_name: string;
  reg_number: string;
  status: CorporateStatus;
  created_at: string;
  updated_at: string;
  cooling_period_start?: string | null;
  cooling_period_end?: string | null;
  
}

export interface CorporateDetails extends Corporate {
    office_address1: string;
    office_address2?: string;
    postcode: string;
    city: string;
    state: string;
    country: string;
    website?: string;
    account_note?: string;
    billing_same_as_official: boolean;
    billing_address1?: string;
    billing_address2?: string;
    billing_postcode?: string;
    billing_city?: string;
    billing_state?: string;
    billing_country?: string;
    company_tin?: string;
    sst_number?: string;
    agreement_from?: string;
    agreement_to?: string;
    credit_limit?: string;
    credit_terms?: string;
    transaction_fee?: string;
    late_payment_interest?: string;
    white_labeling_fee?: string;
    custom_feature_fee?: string;
    agreed_to_generic_terms: boolean;
    agreed_to_commercial_terms: boolean;
    first_approval_confirmation: boolean;
    second_approval_confirmation: boolean | null;
    secondary_approver?: {
        use_existing_contact?: boolean;
        selected_contact_id?: string;
        salutation?: string;
        first_name?: string;
        last_name?: string;
        company_role?: string;
        system_role?: string;
        email?: string;
        contact_number?: string;
    };
    contacts: Contact[];
    subsidiaries: Subsidiary[];
    contactIdsToDelete?: string[];
    subsidiaryIdsToDelete?: string[];
    investigation_log: LogEntry[];
}