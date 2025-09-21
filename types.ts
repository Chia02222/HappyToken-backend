
export type Page = 'Dashboard' | 'RFQ' | 'Merchant' | 'Corporate' | 'API' | 'Configuration' | 'Management' | 'Reports';

export interface NavItem {
  name: Page;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  subItems?: string[];
}

export type CorporateStatus = 'New' | 'Sent' | 'Pending 1st Approval' | 'Pending 2nd Approval' | 'Approved' | 'Rejected' | 'Cooling Period' | 'Resolved' | 'Closed' | 'Reopened';

export interface LogEntry {
  timestamp: string;
  note: string;
  from?: CorporateStatus;
  to?: CorporateStatus;
}

export interface Corporate {
  id: number;
  companyName: string;
  regNumber: string;
  status: CorporateStatus;
  createdAt: string;
  investigationLog: LogEntry[];
}
