"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateData = migrateData;
const serverless_1 = require("@neondatabase/serverless");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const CORPORATES_DATA = [
    { id: 1, companyName: 'Global Tech Inc.', regNumber: '202201012345', status: 'Approved', createdAt: '2024-07-28', investigationLog: [] },
    { id: 2, companyName: 'Synergy Innovations', regNumber: '202301054321', status: 'Approved', createdAt: '2024-07-27', investigationLog: [] },
    { id: 3, companyName: 'Quantum Solutions', regNumber: '202105098765', status: 'Pending 1st Approval', createdAt: '2024-07-26', investigationLog: [] },
    { id: 4, companyName: 'Apex Industries', regNumber: '202003011223', status: 'Pending 1st Approval', createdAt: '2024-07-25', investigationLog: [] },
    { id: 5, companyName: 'Dynamic Corp', regNumber: '201908044556', status: 'Sent', createdAt: '2024-07-24', investigationLog: [] },
    { id: 6, companyName: 'Innovate LLC', regNumber: '202402017890', status: 'New', createdAt: '2024-07-29', investigationLog: [] },
    {
        id: 7, companyName: 'Legacy Holdings', regNumber: '201811116789', status: 'Rejected', createdAt: '2024-07-22',
        investigationLog: [
            { timestamp: new Date('2024-07-23T10:15:00Z').toLocaleString(), note: 'Contacted the company director for clarification. Awaiting response.' }
        ]
    },
    { id: 8, companyName: 'Future Enterprises', regNumber: '202309151357', status: 'Resolved', createdAt: '2024-07-21', investigationLog: [] },
    { id: 9, companyName: 'Pinnacle Group', regNumber: '202207202468', status: 'Closed', createdAt: '2024-07-20', investigationLog: [{ timestamp: new Date().toLocaleString(), from_status: 'Rejected', to_status: 'Closed', note: 'Account closed after investigation.' }] },
    { id: 10, companyName: 'Summit Partners', regNumber: '202104109753', status: 'Reopened', createdAt: '2024-07-19', investigationLog: [] },
];
const CORPORATE_DETAILS_DATA = {
    1: {
        companyName: 'Global Tech Inc.',
        regNumber: '202201012345',
        officeAddress1: 'Suite 30.01, Level 30, The Gardens North Tower',
        postcode: '59200',
        city: 'Kuala Lumpur',
        state: 'W.P. Kuala Lumpur',
        country: 'Malaysia',
        website: 'https://globaltech.com',
        accountNote: 'Leading provider of cloud solutions.',
        contacts: [
            {
                id: 201,
                salutation: 'Ms',
                firstName: 'Jane',
                lastName: 'Doe',
                contactNumber: '111222333',
                email: 'jane.d@globaltech.com',
                companyRole: 'CEO',
                systemRole: 'Administrator',
            }
        ],
        creditLimit: '100000.00',
        credit_terms: '45',
        transactionFee: '1.8',
    },
    2: {
        companyName: 'Synergy Innovations Sdn. Bhd.',
        regNumber: '202301054321',
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
        companyTIN: 'C2345678901',
        sstNumber: 'SST-01-23-45678901',
        agreementFrom: '2024-08-01',
        agreementTo: '2025-07-31',
        credit_terms: '30',
        latePaymentInterest: '1.5',
        whiteLabelingFee: '5.0',
        customFeatureFee: '15000.00',
    },
    3: {
        companyName: 'Quantum Solutions',
        regNumber: '202105098765',
        officeAddress1: 'Block 3730, Persiaran APEC',
        postcode: '63000',
        city: 'Cyberjaya',
        state: 'Selangor',
        country: 'Malaysia',
        website: 'https://quantumsolutions.com',
        accountNote: 'Specializes in quantum computing research.',
        contacts: [
            {
                id: 301,
                salutation: 'Dr',
                firstName: 'Ben',
                lastName: 'Carter',
                contactNumber: '333444555',
                email: 'ben.c@quantumsolutions.com',
                companyRole: 'Lead Scientist',
                systemRole: 'User',
            }
        ],
        credit_terms: '30',
    },
    4: {
        companyName: 'Apex Industries',
        regNumber: '202003011223',
        officeAddress1: '123 Industrial Way',
        city: 'Shah Alam',
        state: 'Selangor',
        postcode: '40150',
        country: 'Malaysia',
        website: 'https://apexindustries.com.my',
        accountNote: 'Major manufacturing client.',
        contacts: [
            {
                id: 401,
                salutation: 'Mr',
                firstName: 'David',
                lastName: 'Chen',
                contactNumber: '178901234',
                email: 'david.c@apexindustries.com.my',
                companyRole: 'Operations Manager',
                systemRole: 'User',
            }
        ],
        creditLimit: '120000.00',
        transactionFee: '2.0',
    },
    5: {
        companyName: 'Dynamic Corp',
        regNumber: '201908044556',
        officeAddress1: 'Level 15, Hunza Tower Gurney Paragon',
        city: 'George Town',
        state: 'Penang',
        postcode: '10250',
        country: 'Malaysia',
        website: 'https://dynamiccorp.com',
        accountNote: 'Key player in the retail sector.',
        contacts: [
            {
                id: 501,
                salutation: 'Ms',
                firstName: 'Emily',
                lastName: 'Liew',
                contactNumber: '165558899',
                email: 'emily.l@dynamiccorp.com',
                companyRole: 'Marketing Head',
                systemRole: 'Administrator',
            }
        ],
        creditLimit: '80000.00',
        transactionFee: '2.2',
    },
    6: {
        companyName: 'Innovate LLC',
        regNumber: '202402017890',
        officeAddress1: 'G-03, SME Technopreneur Centre 3',
        city: 'Cyberjaya',
        state: 'Selangor',
        postcode: '63000',
        country: 'Malaysia',
        website: 'https://innovatellc.io',
        accountNote: 'Tech startup focusing on AI.',
        contacts: [
            {
                id: 601,
                salutation: 'Dr',
                firstName: 'Sarah',
                lastName: 'Tan',
                contactNumber: '191112233',
                email: 'sarah.t@innovatellc.io',
                companyRole: 'R&D Lead',
                systemRole: 'User',
            }
        ],
        creditLimit: '30000.00',
        transactionFee: '2.8',
    },
    7: {
        companyName: 'Legacy Holdings',
        regNumber: '201811116789',
        officeAddress1: 'Level 20, Menara JLand',
        city: 'Johor Bahru',
        state: 'Johor',
        postcode: '80000',
        country: 'Malaysia',
        website: 'https://legacyholdings.com',
        accountNote: 'Investment holding company.',
        contacts: [
            {
                id: 701,
                salutation: 'Mr',
                firstName: 'Michael',
                lastName: 'Raj',
                contactNumber: '128889999',
                email: 'michael.r@legacyholdings.com',
                companyRole: 'Investment Analyst',
                systemRole: 'User',
            }
        ],
        creditLimit: '250000.00',
        transactionFee: '1.5',
    },
    8: {
        companyName: 'Future Enterprises',
        regNumber: '202309151357',
        officeAddress1: 'Sublot 5, Jalan Tun Jugah',
        city: 'Kuching',
        state: 'Sarawak',
        postcode: '93350',
        country: 'Malaysia',
        website: 'https://future-ent.com',
        accountNote: 'East Malaysia regional distributor.',
        contacts: [
            {
                id: 801,
                salutation: 'Ms',
                firstName: 'Brenda',
                lastName: 'Ng',
                contactNumber: '143334455',
                email: 'brenda.n@future-ent.com',
                companyRole: 'Regional Manager',
                systemRole: 'Administrator',
            }
        ],
        creditLimit: '60000.00',
        transactionFee: '2.4',
    },
    9: {
        companyName: 'Pinnacle Group',
        regNumber: '202207202468',
        officeAddress1: 'Level 10, Plaza Shell',
        city: 'Kota Kinabalu',
        state: 'Sabah',
        postcode: '88000',
        country: 'Malaysia',
        website: 'https://pinnaclegroup.my',
        accountNote: 'Property development giant.',
        contacts: [
            {
                id: 901,
                salutation: 'Mr',
                firstName: 'James',
                lastName: 'Wong',
                contactNumber: '137778899',
                email: 'james.w@pinnaclegroup.my',
                companyRole: 'Director',
                systemRole: 'Administrator',
            }
        ],
        creditLimit: '300000.00',
        transactionFee: '1.2',
    },
    10: {
        companyName: 'Summit Partners',
        regNumber: '202104109753',
        officeAddress1: 'Level 50, Petronas Tower 2, KLCC',
        city: 'Kuala Lumpur',
        state: 'W.P. Kuala Lumpur',
        postcode: '50088',
        country: 'Malaysia',
        website: 'https://summitpartners.com',
        accountNote: 'Venture capital and private equity firm.',
        contacts: [
            {
                id: 1001,
                salutation: 'Ms',
                firstName: 'Patricia',
                lastName: 'Lim',
                contactNumber: '182223344',
                email: 'patricia.l@summitpartners.com',
                companyRole: 'Senior Partner',
                systemRole: 'Finance',
            }
        ],
        creditLimit: '500000.00',
        transactionFee: '1.0',
    },
};
async function migrateData() {
    const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
    if (!connectionString) {
        throw new Error('Database connection string not found in environment variables');
    }
    const sql = (0, serverless_1.neon)(connectionString);
    console.log('🔄 Starting data migration...');
    try {
        console.log('🧹 Clearing existing data...');
        await sql `DELETE FROM investigation_logs`;
        await sql `DELETE FROM subsidiaries`;
        await sql `DELETE FROM contacts`;
        await sql `DELETE FROM corporates`;
        console.log('📊 Migrating corporate data...');
        for (const corporate of CORPORATES_DATA) {
            const details = CORPORATE_DETAILS_DATA[corporate.id] || {};
            const corporateData = {
                company_name: corporate.companyName,
                reg_number: corporate.regNumber,
                status: corporate.status,
                office_address1: details.officeAddress1 || '',
                office_address2: details.officeAddress2 || '',
                postcode: details.postcode || '',
                city: details.city || '',
                state: details.state || '',
                country: details.country || 'Malaysia',
                website: details.website || '',
                account_note: details.accountNote || '',
                billing_same_as_official: true,
                billing_address1: '',
                billing_address2: '',
                billing_postcode: '',
                billing_city: '',
                billing_state: '',
                billing_country: 'Malaysia',
                company_tin: details.companyTIN || '',
                sst_number: details.sstNumber || '',
                agreement_from: details.agreementFrom || null,
                agreement_to: details.agreementTo || null,
                credit_limit: details.creditLimit || '0.00',
                credit_terms: details.creditTerms || '',
                transaction_fee: details.transactionFee || '',
                late_payment_interest: details.latePaymentInterest || '',
                white_labeling_fee: details.whiteLabelingFee || '',
                custom_feature_fee: details.customFeatureFee || '0.00',
                agreed_to_generic_terms: false,
                agreed_to_commercial_terms: false,
                first_approval_confirmation: false,
                second_approval_confirmation: false,
                cooling_period_start: null,
                cooling_period_end: null,
                created_at: corporate.createdAt,
                updated_at: new Date().toISOString(),
            };
            const insertedCorporate = await sql `
                INSERT INTO corporates (
                    company_name, reg_number, status, office_address1, office_address2,
                    postcode, city, state, country, website, account_note,
                    billing_same_as_official, billing_address1, billing_address2,
                    billing_postcode, billing_city, billing_state, billing_country,
                    company_tin, sst_number, agreement_from, agreement_to,
                    credit_limit, credit_terms, transaction_fee, late_payment_interest,
                    white_labeling_fee, custom_feature_fee, agreed_to_generic_terms,
                    agreed_to_commercial_terms, first_approval_confirmation, second_approval_confirmation,
                    cooling_period_start, cooling_period_end, created_at, updated_at
                ) VALUES (
                    ${corporateData.company_name}, ${corporateData.reg_number}, ${corporateData.status},
                    ${corporateData.office_address1}, ${corporateData.office_address2},
                    ${corporateData.postcode}, ${corporateData.city}, ${corporateData.state},
                    ${corporateData.country}, ${corporateData.website}, ${corporateData.account_note},
                    ${corporateData.billing_same_as_official}, ${corporateData.billing_address1},
                    ${corporateData.billing_address2}, ${corporateData.billing_postcode},
                    ${corporateData.billing_city}, ${corporateData.billing_state},
                    ${corporateData.billing_country}, ${corporateData.company_tin},
                    ${corporateData.sst_number}, ${corporateData.agreement_from},
                    ${corporateData.agreement_to}, ${corporateData.credit_limit},
                    ${corporateData.credit_terms}, ${corporateData.transaction_fee},
                    ${corporateData.late_payment_interest}, ${corporateData.white_labeling_fee},
                    ${corporateData.custom_feature_fee}, ${corporateData.agreed_to_generic_terms},
                    ${corporateData.agreed_to_commercial_terms}, ${corporateData.first_approval_confirmation},
                    ${corporateData.second_approval_confirmation}, ${corporateData.cooling_period_start},
                    ${corporateData.cooling_period_end}, ${corporateData.created_at}, ${corporateData.updated_at}
                ) RETURNING *
            `;
            const corporateId = insertedCorporate[0].id;
            console.log(`✅ Migrated corporate: ${corporate.companyName} (ID: ${corporateId})`);
            if (details.contacts && Array.isArray(details.contacts)) {
                for (const contact of details.contacts) {
                    await sql `
                        INSERT INTO contacts (
                            corporate_id, salutation, first_name, last_name,
                            contact_number, email, company_role, system_role,
                            created_at, updated_at
                        ) VALUES (
                            ${corporateId}, ${contact.salutation}, ${contact.firstName},
                            ${contact.lastName}, ${contact.contactNumber}, ${contact.email},
                            ${contact.companyRole}, ${contact.systemRole},
                            ${new Date().toISOString()}, ${new Date().toISOString()}
                        )
                    `;
                }
                console.log(`  📞 Migrated ${details.contacts.length} contacts`);
            }
            if (details.subsidiaries && Array.isArray(details.subsidiaries)) {
                for (const subsidiary of details.subsidiaries) {
                    await sql `
                        INSERT INTO subsidiaries (
                            corporate_id, company_name, reg_number, office_address1,
                            office_address2, postcode, city, state, country,
                            website, account_note, created_at, updated_at
                        ) VALUES (
                            ${corporateId}, ${subsidiary.companyName}, ${subsidiary.regNumber},
                            ${subsidiary.officeAddress1}, ${subsidiary.officeAddress2 || ''},
                            ${subsidiary.postcode}, ${subsidiary.city}, ${subsidiary.state},
                            ${subsidiary.country}, ${subsidiary.website || ''},
                            ${subsidiary.accountNote || ''}, ${new Date().toISOString()},
                            ${new Date().toISOString()}
                        )
                    `;
                }
                console.log(`  🏢 Migrated ${details.subsidiaries.length} subsidiaries`);
            }
            if (corporate.investigationLog) {
                for (const log of corporate.investigationLog) {
                    await sql `
                        INSERT INTO investigation_logs (
                            corporate_id, timestamp, note, from_status, to_status, created_at
                        ) VALUES (
                            ${corporateId}, ${log.timestamp}, ${log.note ?? null},
                            ${log.from_status ?? null}, ${log.to_status ?? null}, ${new Date().toISOString()}
                        )
                    `;
                }
                console.log(`  📋 Migrated ${corporate.investigationLog.length} investigation logs`);
            }
        }
        console.log('✅ Data migration completed successfully!');
        console.log(`📊 Migrated ${CORPORATES_DATA.length} corporate accounts with all related data`);
    }
    catch (error) {
        console.error('❌ Data migration failed:', error);
        throw error;
    }
}
migrateData().catch((err) => {
    console.error('❌ Data migration failed:', err);
    process.exit(1);
});
//# sourceMappingURL=migrate-data.js.map