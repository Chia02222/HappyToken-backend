import { z } from 'zod';

// Optional positive number stored as string in form fields
const positiveNumStringOptional = z
  .union([z.string().trim().length(0), z.string().trim()])
  .optional()
  .nullable()
  .refine((v) => {
    if (v == null) return true;
    const val = String(v).trim();
    if (val.length === 0) return true;
    const normalized = val.replace(/,/g, '');
    const num = Number(normalized);
    return !Number.isNaN(num) && num >= 0;
  }, 'Must be a positive number');

export const corporateFormSchema = z
  .object({
    // Company Information
    company_name: z.string().trim().min(1, 'Company Name is required'),
    reg_number: z.string().trim().min(1, 'Registration Number is required'),
    office_address1: z.string().trim().min(1, 'Office Address 1 is required'),
    office_address2: z.string().optional().nullable(),
    postcode: z.string().trim().min(1, 'Postcode is required'),
    city: z.string().trim().min(1, 'City is required'),
    state: z.string().trim().min(1, 'State is required'),
    country: z.string().trim().min(1, 'Country is required'),

    // Contacts (require primary)
    contacts: z
      .array(
        z.object({
          id: z.string().optional(),
          salutation: z.string().optional(),
          first_name: z.string().trim().min(1, 'First name is required'),
          last_name: z.string().trim().min(1, 'Last name is required'),
          contact_number: z.string().trim().min(1, 'Contact number is required'),
          email: z.string().trim().email('Invalid email'),
          company_role: z.string().optional(),
          system_role: z.string().optional(),
        })
      )
      .min(1, 'At least one contact is required'),

    // Billing
    billing_same_as_official: z.boolean(),
    billing_address1: z.string().optional().nullable(),
    billing_address2: z.string().optional().nullable(),
    billing_postcode: z.string().optional().nullable(),
    billing_city: z.string().optional().nullable(),
    billing_state: z.string().optional().nullable(),
    billing_country: z.string().optional().nullable(),

    // Tax
    company_tin: z.string().trim().min(1, 'Company TIN is required'),
    sst_number: z.string().optional().nullable(),

    // Commercial Terms (optional)
    agreement_from: z.string().trim().optional().nullable(),
    agreement_to: z.string().trim().optional().nullable(),
    credit_limit: positiveNumStringOptional,
    credit_terms: positiveNumStringOptional,
    transaction_fee: positiveNumStringOptional,
    late_payment_interest: positiveNumStringOptional,
    white_labeling_fee: positiveNumStringOptional,
    custom_feature_fee: positiveNumStringOptional,
  })
  .refine((d) => {
    if (!d.agreement_from || !d.agreement_to) return true;
    return new Date(d.agreement_from) <= new Date(d.agreement_to);
  }, {
    message: 'End date must be on or after start date',
    path: ['agreement_to'],
  })
  .refine(
    (d) =>
      d.billing_same_as_official ||
      Boolean(
        d.billing_address1 &&
          d.billing_postcode &&
          d.billing_city &&
          d.billing_state &&
          d.billing_country
      ),
    {
      message: 'Billing address is required when not same as official',
      path: ['billing_address1'],
    }
  );

export type CorporateFormInput = z.infer<typeof corporateFormSchema>;


