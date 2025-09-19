import { GeneratedAlways, Selectable, Insertable, Updateable } from 'kysely';


export interface Database {
  corporates: CorporateTable;
  contacts: ContactTable;
  subsidiaries: SubsidiaryTable;
  investigation_logs: InvestigationLogTable;
}

//Enums
export type CorporateStatus = 
  | 'New' 
  | 'Send' 
  | 'Pending 1st Approval' 
  | 'Pending 2nd Approval' 
  | 'Approved' 
  | 'Rejected' 
  | 'Cooling Period' 
  | 'Resolved' 
  | 'Closed' 
  | 'Reopened'
  | 'Under Fraud Investigation';

export type CorporateSystemRole = 'admin' | 'user';

export interface CorporateTable {
  id: GeneratedAlways<string>;
  company_name: string;
  reg_number: string;
  status: CorporateStatus;
  office_address1: string;
  office_address2: string | null;
  postcode: string;
  city: string;
  state: string;
  country: string;
  website: string | null;
  account_note: string | null;
  billing_same_as_official: boolean;
  billing_address1: string;
  billing_address2: string;
  billing_postcode: string;
  billing_city: string;
  billing_state: string;
  billing_country: string;
  company_tin: string;
  sst_number: string;
  agreement_from: string | null;
  agreement_to: string | null;
  credit_limit: string;
  credit_terms: string;
  transaction_fee: string;
  late_payment_interest: string;
  white_labeling_fee: string;
  custom_feature_fee: string;
  agreed_to_generic_terms: boolean;
  agreed_to_commercial_terms: boolean;
  first_approval_confirmation: boolean;
  second_approval_confirmation: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactTable {
  id: GeneratedAlways<string>;
  corporate_id: string;
  salutation: string;
  first_name: string;
  last_name: string;
  contact_number: string;
  email: string;
  company_role: string;
  system_role: string;
  created_at: string;
  updated_at: string;
}

export interface SubsidiaryTable {
  id: GeneratedAlways<string>;
  corporate_id: string;
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
}

export interface InvestigationLogTable {
  id: GeneratedAlways<string>;
  corporate_id: string;
  timestamp: string;
  note: string | null;
  from_status: CorporateStatus | null;
  to_status: CorporateStatus | null;
  created_at: string;
}

// Define the types for your operations
export type Corporate = Selectable<CorporateTable>;
export type NewCorporate = Insertable<CorporateTable>;
export type CorporateUpdate = Updateable<CorporateTable>;

export type Contact = Selectable<ContactTable>;
export type NewContact = Insertable<ContactTable>;
export type ContactUpdate = Updateable<ContactTable>;

export type Subsidiary = Selectable<SubsidiaryTable>;
export type NewSubsidiary = Insertable<SubsidiaryTable>;
export type SubsidiaryUpdate = Updateable<SubsidiaryTable>;

export type InvestigationLog = Selectable<InvestigationLogTable>;
export type NewInvestigationLog = Insertable<InvestigationLogTable>;