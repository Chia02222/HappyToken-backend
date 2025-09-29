import { Injectable } from '@nestjs/common';
import { CorporateService } from '../modules/corporate/corporate.service';
import { CorporateStatus } from '../database/types';
import { DatabaseService } from '../database/database.service';
import { ContactsService } from '../modules/contacts/contacts.service';
import { SubsidiariesService } from '../modules/subsidiaries/subsidiaries.service';

@Injectable()
export class SeedService {
  constructor(
    private readonly corporateService: CorporateService,
    private readonly dbService: DatabaseService,
    private readonly contactsService: ContactsService,
    private readonly subsidiariesService: SubsidiariesService,
  ) {}

  async seedDatabase() {
    console.log('🌱 Starting database seeding...');

    // Mock data from the frontend constants
    const mockCorporates = [
      {
        company_name: 'Global Tech Inc.',
        reg_number: '202201012345',
        status: 'Approved' as CorporateStatus,
        office_address1: 'Suite 30.01, Level 30, The Gardens North Tower',
        office_address2: null,
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
        agreement_from: null,
        agreement_to: null,
        credit_limit: '100000.00',
        credit_terms: '45',
        transaction_fee: '1.8',
        late_payment_interest: '',
        white_labeling_fee: '',
        custom_feature_fee: '0.00',
        agreed_to_generic_terms: false,
        agreed_to_commercial_terms: false,
        first_approval_confirmation: false,
        second_approval_confirmation: false,
      },
      {
        company_name: 'Synergy Innovations',
        reg_number: '202301054321',
        status: 'Cooling Period' as CorporateStatus,
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
        second_approval_confirmation: false,
      },
      {
        company_name: 'Quantum Solutions',
        reg_number: '202105098765',
        status: 'Pending 1st Approval' as CorporateStatus,
        office_address1: 'Block 3730, Persiaran APEC',
        office_address2: null,
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
        agreement_from: null,
        agreement_to: null,
        credit_limit: '75000.00',
        credit_terms: '30',
        transaction_fee: '3.0',
        late_payment_interest: '',
        white_labeling_fee: '',
        custom_feature_fee: '0.00',
        agreed_to_generic_terms: false,
        agreed_to_commercial_terms: false,
        first_approval_confirmation: false,
        second_approval_confirmation: false,
      },
    ];

    try {
      
      // Seed corporates
      console.log('📊 Seeding corporates...');
      for (const corporateData of mockCorporates) {
        const corporate = await this.corporateService.create(corporateData);
        console.log(`✅ Created corporate: ${corporate.company_name}`);

        // Add sample contacts
        const corpUuid = (corporate as any).uuid ?? (corporate as any).id;
        if (corpUuid) {
                

          // Add a second contact for Global Tech Inc.
          if (corporate.company_name === 'Global Tech Inc.') {
            await this.contactsService.addContact({
              corporate_uuid: corpUuid,
              salutation: 'Mr',
              first_name: 'John',
              last_name: 'Smith',
              contact_number: '999888777',
              email: 'john.s@example.com',
              company_role: 'CFO',
              system_role: 'Finance',
            });

            // Add a sample subsidiary for Global Tech Inc.
            await this.subsidiariesService.addSubsidiary({
              corporate_uuid: corpUuid,
              company_name: 'Global Tech Solutions',
              reg_number: '202301010001',
              office_address1: '123 Tech Park',
              office_address2: null,
              postcode: '12345',
              city: 'Cyberjaya',
              state: 'Selangor',
              country: 'Malaysia',
              website: 'https://globaltechsolutions.com',
              account_note: 'Subsidiary for software development',
            });

            // Add a sample investigation log for Global Tech Inc.
            await this.corporateService.addInvestigationLog(String(corpUuid), {
              timestamp: new Date().toISOString(),
              note: 'Initial review completed. No issues found.',
              from_status: 'Draft',
              to_status: 'Approved',
              amendment_data: null,
            });
          }
        }
      }

      console.log('✅ Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }
}
