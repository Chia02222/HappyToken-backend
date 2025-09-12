
import { NavItem } from './types';
import { DashboardIcon, RfqIcon, MerchantIcon, CorporateIcon, ApiIcon, SettingsIcon, ReportsIcon } from './src/components/Icons';

export const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', icon: DashboardIcon },
  { name: 'RFQ', icon: RfqIcon },
  { name: 'Merchant', icon: MerchantIcon },
  { name: 'Corporate', icon: CorporateIcon },
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

export const MOCK_FORM_DATA = {
    companyName: 'Synergy Innovations Sdn. Bhd.',
    regNumber: '202301012345 (1508123-A)',
    officeAddress1: 'Level 25, Menara Worldwide',
    officeAddress2: '198, Jalan Bukit Bintang',
    postcode: '55100',
    city: 'Kuala Lumpur',
    state: 'W.P. Kuala Lumpur',
    country: 'Malaysia',
    website: 'https://synergyinnovations.com.my',
    accountNote: 'Priority client. Focus on digital voucher solutions.',
    subsidiaries: [
        {
            id: 1,
            companyName: 'Synergy Digital Ventures',
            regNumber: '202401054321 (1509876-B)',
            officeAddress1: 'Suite 10.01, The Gardens North Tower',
            officeAddress2: '',
            postcode: '59200',
            city: 'Kuala Lumpur',
            state: 'W.P. Kuala Lumpur',
            country: 'Malaysia',
            website: 'https://synergydigital.com.my',
            accountNote: 'Handles tech development.',
        }
    ],
    contacts: [
        {
            id: 101,
            salutation: 'Mr',
            firstName: 'Ahmad',
            lastName: 'Zulkifli',
            contactNumber: '123456789',
            email: 'ahmad.z@synergyinnovations.com.my',
            companyRole: 'Managing Director',
            systemRole: 'Administrator',
        },
        {
            id: 102,
            salutation: 'Ms',
            firstName: 'Siti',
            lastName: 'Rahman',
            contactNumber: '198765432',
            email: 'siti.r@synergyinnovations.com.my',
            companyRole: 'Finance Manager',
            systemRole: 'Finance',
        }
    ],
    billingSameAsOfficial: true,
    billingAddress1: '',
    billingAddress2: '',
    billingPostcode: '',
    billingCity: '',
    billingState: '',
    billingCountry: 'Malaysia',
    companyTIN: 'C2345678901',
    sstNumber: 'SST-01-23-45678901',
    agreementFrom: '2024-08-01',
    agreementTo: '2025-07-31',
    creditLimit: '50000.00',
    creditTerms: '30',
    transactionFee: '2.5',
    latePaymentInterest: '1.5',
    whiteLabelingFee: '5.0',
    customFeatureFee: '15000.00',
    agreedToGenericTerms: false,
    agreedToCommercialTerms: false,
    firstApprovalConfirmation: false,
    secondaryApprover: {
        useExistingContact: false,
        selectedContactId: '',
        signatoryName: '',
        companyRole: '',
        systemRole: '',
        email: '',
        contactNumber: '',
    },
};
