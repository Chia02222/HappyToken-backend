"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const corporate_service_1 = require("../corporate/corporate.service");
let SeedService = class SeedService {
    corporateService;
    constructor(corporateService) {
        this.corporateService = corporateService;
    }
    async seedDatabase() {
        console.log('🌱 Starting database seeding...');
        const mockCorporates = [
            {
                company_name: 'Global Tech Inc.',
                reg_number: '202201012345',
                status: 'Approved',
                office_address1: 'Suite 30.01, Level 30, The Gardens North Tower',
                office_address2: '',
                postcode: '59200',
                city: 'Kuala Lumpur',
                state: 'W.P. Kuala Lumpur',
                country: 'Malaysia',
                website: 'https://globaltech.com',
                account_note: 'Leading provider of cloud solutions.',
                billing_same_as_official: true,
                billing_address1: '',
                billing_address2: '',
                billing_postcode: '',
                billing_city: '',
                billing_state: '',
                billing_country: 'Malaysia',
                company_tin: '',
                sst_number: '',
                agreement_from: '',
                agreement_to: '',
                credit_limit: '100000.00',
                credit_terms: '45',
                transaction_fee: '1.8',
                late_payment_interest: '',
                white_labeling_fee: '',
                custom_feature_fee: '0.00',
                agreed_to_generic_terms: false,
                agreed_to_commercial_terms: false,
                first_approval_confirmation: false,
            },
            {
                company_name: 'Synergy Innovations',
                reg_number: '202301054321',
                status: 'Cooling Period',
                office_address1: 'Level 25, Menara Worldwide',
                office_address2: '198, Jalan Bukit Bintang',
                postcode: '55100',
                city: 'Kuala Lumpur',
                state: 'W.P. Kuala Lumpur',
                country: 'Malaysia',
                website: 'https://synergyinnovations.com.my',
                account_note: 'Priority client. Focus on digital voucher solutions.',
                billing_same_as_official: true,
                billing_address1: '',
                billing_address2: '',
                billing_postcode: '',
                billing_city: '',
                billing_state: '',
                billing_country: 'Malaysia',
                company_tin: 'C2345678901',
                sst_number: 'SST-01-23-45678901',
                agreement_from: '2024-08-01',
                agreement_to: '2025-07-31',
                credit_limit: '50000.00',
                credit_terms: '30',
                transaction_fee: '2.5',
                late_payment_interest: '1.5',
                white_labeling_fee: '5.0',
                custom_feature_fee: '15000.00',
                agreed_to_generic_terms: false,
                agreed_to_commercial_terms: false,
                first_approval_confirmation: false,
            },
            {
                company_name: 'Quantum Solutions',
                reg_number: '202105098765',
                status: 'Pending 1st Approval',
                office_address1: 'Block 3730, Persiaran APEC',
                office_address2: '',
                postcode: '63000',
                city: 'Cyberjaya',
                state: 'Selangor',
                country: 'Malaysia',
                website: 'https://quantumsolutions.com',
                account_note: 'Specializes in quantum computing research.',
                billing_same_as_official: true,
                billing_address1: '',
                billing_address2: '',
                billing_postcode: '',
                billing_city: '',
                billing_state: '',
                billing_country: 'Malaysia',
                company_tin: '',
                sst_number: '',
                agreement_from: '',
                agreement_to: '',
                credit_limit: '75000.00',
                credit_terms: '30',
                transaction_fee: '3.0',
                late_payment_interest: '',
                white_labeling_fee: '',
                custom_feature_fee: '0.00',
                agreed_to_generic_terms: false,
                agreed_to_commercial_terms: false,
                first_approval_confirmation: false,
            },
        ];
        try {
            console.log('🧹 Clearing existing data...');
            console.log('📊 Seeding corporates...');
            for (const corporateData of mockCorporates) {
                const corporate = await this.corporateService.create(corporateData);
                console.log(`✅ Created corporate: ${corporate.company_name}`);
                if (corporate.id) {
                    await this.corporateService.addContact(corporate.id, {
                        salutation: 'Ms',
                        first_name: 'Jane',
                        last_name: 'Doe',
                        contact_number: '111222333',
                        email: 'jane.d@example.com',
                        company_role: 'CEO',
                        system_role: 'Administrator',
                    });
                }
            }
            console.log('✅ Database seeding completed successfully!');
        }
        catch (error) {
            console.error('❌ Database seeding failed:', error);
            throw error;
        }
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [corporate_service_1.CorporateService])
], SeedService);
//# sourceMappingURL=seed.service.js.map