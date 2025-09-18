import { NavItem } from './types';
import { DashboardIcon, RfqIcon, MerchantIcon, CorporateIcon, ApiIcon, SettingsIcon, ReportsIcon } from './components/Icons';

export const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', icon: DashboardIcon },
  { name: 'RFQ', icon: RfqIcon },
  { name: 'Merchant', icon: MerchantIcon },
  { name: 'CRT Corporate', icon: CorporateIcon },
  { name: 'Approver Corporate', icon: CorporateIcon },
  { name: 'API', icon: ApiIcon },
];

export const SETTINGS_ITEMS: NavItem[] = [
    { name: 'Configuration', icon: SettingsIcon },
    { name: 'Management', icon: SettingsIcon },
];

export const REPORTS_ITEMS: NavItem = {
    name: 'Reports',
    icon: ReportsIcon,
    subItems: ['Merchant Report', 'Corporate Report', 'Admin Report'],
};
