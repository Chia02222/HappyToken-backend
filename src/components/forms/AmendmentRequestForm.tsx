'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import InputField from '../common/InputField';
import SelectField from '../common/SelectField';
import FormSection from '../common/FormSection';
import { Subsidiary } from '../../types';

interface AmendmentRequestFormProps {
  corporateId: string;
  originalData: any;
  onSave: (amendmentData: any) => Promise<void>;
  onCancel: () => void;
}

interface Contact {
  id: string;
  salutation: string;
  first_name: string;
  last_name: string;
  contact_number: string;
  email: string;
  company_role: string;
  system_role: string;
}

interface FormData {
  // Company Information
  company_name: string;
  reg_number: string;
  office_address1: string;
  office_address2: string;
  postcode: string;
  city: string;
  state: string;
  country: string;
  website: string;
  
  // Contact Person
  contacts: any[];
  // Subsidiaries
  subsidiaries: Subsidiary[];
  subsidiaryIdsToDelete?: string[];
  
  // Billing Address
  billing_same_as_official: boolean;
  billing_address1: string;
  billing_address2: string;
  billing_postcode: string;
  billing_city: string;
  billing_state: string;
  billing_country: string;
  
  // Tax Information
  company_tin: string;
  sst_number: string;
  
  // Commercial Terms
  agreement_from: string;
  agreement_to: string;
  credit_limit: string;
  credit_terms: string;
  transaction_fee: string;
  late_payment_interest: string;
  white_labeling_fee: string;
  custom_feature_fee: string;
  
  // Account Note
  account_note: string;
}

const AmendmentRequestForm: React.FC<AmendmentRequestFormProps> = ({
  corporateId,
  originalData,
  onSave,
  onCancel
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    company_name: originalData?.company_name || '',
    reg_number: originalData?.reg_number || '',
    office_address1: originalData?.office_address1 || '',
    office_address2: originalData?.office_address2 || '',
    postcode: originalData?.postcode || '',
    city: originalData?.city || '',
    state: originalData?.state || '',
    country: originalData?.country || 'Malaysia',
    website: originalData?.website || '',
    contacts: originalData?.contacts || [
      {
        id: '1',
        salutation: 'Mr',
        first_name: '',
        last_name: '',
        contact_number: '',
        email: '',
        company_role: '',
        system_role: '',
      }
    ],
    subsidiaries: originalData?.subsidiaries || [],
    subsidiaryIdsToDelete: originalData?.subsidaryIdsToDelete || [],
    billing_same_as_official: originalData?.billing_same_as_official ?? true,
    billing_address1: originalData?.billing_address1 || '',
    billing_address2: originalData?.billing_address2 || '',
    billing_postcode: originalData?.billing_postcode || '',
    billing_city: originalData?.billing_city || '',
    billing_state: originalData?.billing_state || '',
    billing_country: originalData?.billing_country || 'Malaysia',
    company_tin: originalData?.company_tin || '',
    sst_number: originalData?.sst_number || '',
    agreement_from: originalData?.agreement_from || '',
    agreement_to: originalData?.agreement_to || '',
    credit_limit: originalData?.credit_limit || '',
    credit_terms: originalData?.credit_terms || '',
    transaction_fee: originalData?.transaction_fee || '',
    late_payment_interest: originalData?.late_payment_interest || '',
    white_labeling_fee: originalData?.white_labeling_fee || '',
    custom_feature_fee: originalData?.custom_feature_fee || '',
    account_note: originalData?.account_note || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleContactChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const addContact = () => {
    setFormData(prev => ({
      ...prev,
      contacts: [
        ...prev.contacts,
        {
          id: String(Date.now()),
          salutation: 'Mr',
          first_name: '',
          last_name: '',
          contact_number: '',
          email: '',
          company_role: '',
          system_role: '',
        }
      ]
    }));
  };

  const removeContact = (index: number) => {
    if (formData.contacts.length > 1) {
      setFormData(prev => ({
        ...prev,
        contacts: prev.contacts.filter((_, i) => i !== index)
      }));
    }
  };

  const addSubsidiary = () => {
    setFormData(prev => ({
      ...prev,
      subsidiaries: [
        ...prev.subsidiaries,
        {
          id: String(Date.now()),
          company_name: '',
          reg_number: '',
          office_address1: '',
          office_address2: '',
          postcode: '',
          city: '',
          state: '',
          country: 'Malaysia',
          website: '',
          account_note: '',
        } as Subsidiary,
      ],
    }));
  };

  const handleSubsidiaryChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = prev.subsidiaries.map((sub, i) => (i === index ? { ...sub, [name]: value } : sub));
      return { ...prev, subsidiaries: updated };
    });
  };

  const removeSubsidiary = (index: number) => {
    setFormData(prev => {
      const toRemove = prev.subsidiaries[index];
      const remaining = prev.subsidiaries.filter((_, i) => i !== index);
      const ids = toRemove?.id ? [ ...(prev.subsidiaryIdsToDelete || []), String(toRemove.id) ] : prev.subsidiaryIdsToDelete;
      return { ...prev, subsidiaries: remaining, subsidiaryIdsToDelete: ids };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required';
    }

    if (!formData.reg_number.trim()) {
      newErrors.reg_number = 'Registration number is required';
    }

    if (!formData.company_tin.trim()) {
      newErrors.company_tin = 'Company TIN is required';
    }

    // Validate primary contact
    const primaryContact = formData.contacts[0];
    if (!primaryContact.first_name.trim()) {
      newErrors['contacts.0.first_name'] = 'Primary contact first name is required';
    }
    if (!primaryContact.last_name.trim()) {
      newErrors['contacts.0.last_name'] = 'Primary contact last name is required';
    }
    if (!primaryContact.email.trim()) {
      newErrors['contacts.0.email'] = 'Primary contact email is required';
    }
    if (!primaryContact.contact_number.trim()) {
      newErrors['contacts.0.contact_number'] = 'Primary contact phone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const amendmentData = {
        originalData: originalData,
        amendedData: formData
      };

      await onSave(amendmentData);
    } catch (error) {
      console.error('Error saving amendment request:', error);
      setErrors({ submit: 'Failed to save amendment request. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges = () => {
    return Object.keys(formData).some(key => {
      if (key === 'contacts') {
        return JSON.stringify(formData.contacts) !== JSON.stringify(originalData?.contacts || []);
      }
      return formData[key as keyof FormData] !== (originalData?.[key] || '');
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Company Information & Official Address */}
        <FormSection title="Company Information & Official Address">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <InputField
              id="company_name"
              label="Company Name"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              required
              error={errors.company_name}
            />
            <InputField
              id="reg_number"
              label="Official Registration Number"
              name="reg_number"
              value={formData.reg_number}
              onChange={handleChange}
              required
              error={errors.reg_number}
            />
            <InputField
              id="office_address1"
              label="Office Address 1"
              name="office_address1"
              value={formData.office_address1}
              onChange={handleChange}
            />
            <InputField
              id="office_address2"
              label="Office Address 2"
              name="office_address2"
              value={formData.office_address2}
              onChange={handleChange}
            />
            <InputField
              id="postcode"
              label="Postcode"
              name="postcode"
              value={formData.postcode}
              onChange={handleChange}
            />
            <InputField
              id="city"
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
            <SelectField id="state" label="State" name="state" value={formData.state} onChange={handleChange}>
              <option value="">Select State</option>
              {['Johor','Kedah','Kelantan','Melaka','Negeri Sembilan','Pahang','Penang','Perak','Perlis','Sabah','Sarawak','Selangor','Terengganu','W.P. Kuala Lumpur','W.P. Labuan','W.P. Putrajaya'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </SelectField>
            <SelectField id="country" label="Country" name="country" value={formData.country} onChange={handleChange}>
              <option>Malaysia</option>
              <option>Singapore</option>
            </SelectField>
            <InputField
              id="website"
              label="Website"
              name="website"
              type={formData.website === 'N/A' ? 'text' : 'url'}
              value={formData.website}
              onChange={handleChange}
            />
          </div>
        </FormSection>

        {/* Subsidiaries */}
        <FormSection title="Subsidiaries">
          {formData.subsidiaries.map((sub, index) => (
            <div key={sub.id ?? index} className="mb-6 p-4 border rounded-lg bg-gray-50/50">
              <div className="flex justify-between items-center mb-4 pb-3 border-b">
                <h4 className="font-semibold text-gray-800">Subsidiary {index + 1}</h4>
                <button type="button" onClick={() => removeSubsidiary(index)} className="text-sm text-red-600 hover:text-red-800 font-semibold">Remove</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <InputField id={`sub-company_name-${index}`} label="Company Name" name="company_name" value={sub.company_name} onChange={(e) => handleSubsidiaryChange(index, e)} />
                <InputField id={`sub-reg_number-${index}`} label="Official Registration Number" name="reg_number" value={sub.reg_number} onChange={(e) => handleSubsidiaryChange(index, e)} />
                <InputField id={`sub-office_address1-${index}`} label="Office Address 1" name="office_address1" value={sub.office_address1} onChange={(e) => handleSubsidiaryChange(index, e)} />
                <InputField id={`sub-office_address2-${index}`} label="Office Address 2" name="office_address2" value={sub.office_address2 || ''} onChange={(e) => handleSubsidiaryChange(index, e)} />
                <InputField id={`sub-postcode-${index}`} label="Postcode" name="postcode" value={sub.postcode} onChange={(e) => handleSubsidiaryChange(index, e)} />
                <InputField id={`sub-city-${index}`} label="City" name="city" value={sub.city} onChange={(e) => handleSubsidiaryChange(index, e)} />
                <SelectField id={`sub-state-${index}`} label="State" name="state" value={sub.state} onChange={(e) => handleSubsidiaryChange(index, e)}>
                  <option value="">Select State</option>
                  {['Johor','Kedah','Kelantan','Melaka','Negeri Sembilan','Pahang','Penang','Perak','Perlis','Sabah','Sarawak','Selangor','Terengganu','W.P. Kuala Lumpur','W.P. Labuan','W.P. Putrajaya'].map((s) => <option key={s} value={s}>{s}</option>)}
                </SelectField>
                <SelectField id={`sub-country-${index}`} label="Country" name="country" value={sub.country} onChange={(e) => handleSubsidiaryChange(index, e)}>
                  <option>Malaysia</option>
                  <option>Singapore</option>
                </SelectField>
                <div className="md:col-span-2">
                  <InputField id={`sub-website-${index}`} label="Website" name="website" value={sub.website || ''} onChange={(e) => handleSubsidiaryChange(index, e)} />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor={`sub-account_note-${index}`} className="block text-xs font-medium text-gray-700 mb-1">Account Note</label>
                  <textarea id={`sub-account_note-${index}`} name="account_note" value={sub.account_note || ''} onChange={(e) => handleSubsidiaryChange(index, e)} rows={3} className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-ht-blue focus:border-ht-blue bg-white dark:bg-white"></textarea>
                </div>
              </div>
            </div>
          ))}
          <div className="mt-2">
            <button type="button" onClick={addSubsidiary} className="text-sm text-ht-blue hover:text-ht-blue-dark font-semibold">+ Add Subsidiary</button>
          </div>
        </FormSection>

        {/* 2. Contact Person */}
        <FormSection title="Contact Person">
          {formData.contacts.map((contact, index) => (
            <div key={contact.id} className={index > 0 ? "mt-6 pt-6 border-t" : ""}>
              {formData.contacts.length > 1 && (
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-gray-800">Contact Person {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeContact(index)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <SelectField
                  id={`salutation_${index}`}
                  label="Salutation"
                  name="salutation"
                  value={contact.salutation}
                  onChange={(e) => handleContactChange(index, 'salutation', e.target.value)}
                >
                  <option>Mr</option>
                  <option>Mrs</option>
                  <option>Ms</option>
                </SelectField>
                <div></div>

                <InputField
                  id={`first_name_${index}`}
                  label="First Name"
                  name="first_name"
                  value={contact.first_name}
                  onChange={(e) => handleContactChange(index, 'first_name', e.target.value)}
                  required={index === 0}
                  error={errors[`contacts.${index}.first_name`]}
                />
                <InputField
                  id={`last_name_${index}`}
                  label="Last Name"
                  name="last_name"
                  value={contact.last_name}
                  onChange={(e) => handleContactChange(index, 'last_name', e.target.value)}
                  required={index === 0}
                  error={errors[`contacts.${index}.last_name`]}
                />

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">*Contact Number</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">+60</span>
                    <input
                      type="text"
                      id={`contact_number_${index}`}
                      name="contact_number"
                      value={contact.contact_number}
                      onChange={(e) => handleContactChange(index, 'contact_number', e.target.value)}
                      className={`flex-1 block w-full rounded-none rounded-r-md border p-2 text-sm focus:ring-ht-blue bg-white dark:bg-white ${errors[`contacts.${index}.contact_number`] ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-ht-blue'}`}
                    />
                  </div>
                  {errors[`contacts.${index}.contact_number`] && (
                    <p className="mt-1 text-xs text-red-600">{errors[`contacts.${index}.contact_number`]}</p>
                  )}
                </div>

                <InputField
                  id={`email_${index}`}
                  label="Email Address"
                  name="email"
                  type="email"
                  value={contact.email}
                  onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                  required={index === 0}
                  error={errors[`contacts.${index}.email`]}
                />

                <InputField
                  id={`company_role_${index}`}
                  label="Company Role"
                  name="company_role"
                  value={contact.company_role}
                  onChange={(e) => handleContactChange(index, 'company_role', e.target.value)}
                  required
                />
                <SelectField
                  id={`system_role_${index}`}
                  label="System Role"
                  name="system_role"
                  value={contact.system_role}
                  onChange={(e) => handleContactChange(index, 'system_role', e.target.value)}
                >
                  <option>Select Role</option>
                </SelectField>
              </div>
            </div>
          ))}
          <div className="mt-6">
            <button
              type="button"
              onClick={addContact}
              className="text-sm text-ht-blue hover:text-ht-blue-dark font-semibold"
            >
              + Create another person
            </button>
          </div>
        </FormSection>

        {/* 4. Billing Address */}
        <FormSection title="Billing Address">
          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="billing_same_as_official"
              name="billing_same_as_official"
              checked={formData.billing_same_as_official}
              onChange={handleChange}
              className="h-4 w-4 border-gray-300 rounded focus:ring-ht-gray"
            />
            <label htmlFor="billing_same_as_official" className="ml-2 block text-sm text-gray-900">
              Same as Official Address
            </label>
          </div>
          {!formData.billing_same_as_official && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <InputField
                id="billing_address1"
                label="Billing Address 1"
                name="billing_address1"
                value={formData.billing_address1}
                onChange={handleChange}
              />
              <InputField
                id="billing_address2"
                label="Billing Address 2"
                name="billing_address2"
                value={formData.billing_address2}
                onChange={handleChange}
              />
              <InputField
                id="billing_postcode"
                label="Billing Postcode"
                name="billing_postcode"
                value={formData.billing_postcode}
                onChange={handleChange}
              />
              <InputField
                id="billing_city"
                label="Billing City"
                name="billing_city"
                value={formData.billing_city}
                onChange={handleChange}
              />
              <InputField
                id="billing_state"
                label="Billing State"
                name="billing_state"
                value={formData.billing_state}
                onChange={handleChange}
              />
              <InputField
                id="billing_country"
                label="Billing Country"
                name="billing_country"
                value={formData.billing_country}
                onChange={handleChange}
              />
            </div>
          )}
        </FormSection>

        {/* 5. Tax Information */}
        <FormSection title="Tax Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <InputField
              id="company_tin"
              label="Company TIN"
              name="company_tin"
              value={formData.company_tin}
              onChange={handleChange}
              required
              error={errors.company_tin}
            />
            <InputField
              id="sst_number"
              label="SST Number"
              name="sst_number"
              value={formData.sst_number}
              onChange={handleChange}
            />
          </div>
        </FormSection>

        {/* 6. Commercial Terms */}
        <FormSection title="Commercial Terms">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Agreement Duration</label>
              <div className="flex items-center space-x-2">
                <InputField
                  id="agreementFrom"
                  label=""
                  name="agreement_from"
                  type="date"
                  value={(formData.agreement_from ? String(formData.agreement_from).slice(0,10) : '')}
                  onChange={handleChange}
                  min={new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' })}
                />
                <span className="text-gray-500">to</span>
                <InputField
                  id="agreementTo"
                  label=""
                  name="agreement_to"
                  type="date"
                  value={(formData.agreement_to ? String(formData.agreement_to).slice(0,10) : '')}
                  onChange={handleChange}
                  min={(formData.agreement_from ? String(formData.agreement_from).slice(0,10) : new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Credit Limit</label>
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 h-[38px] rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">MYR</span>
                <InputField id="creditLimit" label="" name="credit_limit" value={formData.credit_limit ?? ''} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Credit Terms</label>
              <div className="flex items-center">
                <InputField id="creditTerms" label="" name="credit_terms" value={formData.credit_terms ?? ''} onChange={handleChange} />
                <span className="ml-2 text-gray-500">days from invoice date</span>
              </div>
            </div>

            <InputField id="transactionFee" label="Transaction Fees Rate (% based on total purchased amount)" name="transaction_fee" value={formData.transaction_fee ?? ''} onChange={handleChange} />
            <InputField id="latePaymentInterest" label="Late Payment Interest (% per 14 days)" name="late_payment_interest" value={formData.late_payment_interest ?? ''} onChange={handleChange} />

            <InputField id="whiteLabelingFee" label="White Labeling Fee (*only when request) (% based on total purchased amount)" name="white_labeling_fee" value={formData.white_labeling_fee ?? ''} onChange={handleChange} />

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Custom Feature Request Fee (*only when request)</label>
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 h-[38px] rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">MYR</span>
                <InputField id="custom_feature_fee" label="" name="custom_feature_fee" value={formData.custom_feature_fee ?? ''} onChange={handleChange} />
              </div>
            </div>
          </div>
        </FormSection>

        {/* 7. Additional Information */}
        <FormSection title="Additional Information">
          <div>
            <label htmlFor="account_note" className="block text-xs font-medium text-gray-700 mb-1">
              Account Note
            </label>
            <textarea
              id="account_note"
              name="account_note"
              value={formData.account_note}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ht-blue"
              placeholder="Additional notes about the account..."
            />
          </div>
        </FormSection>

        {/* Change Summary */}
        {hasChanges() && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">Note</h3>
            <p className="text-sm text-yellow-700">
              Your request will be submitted to the CRT team for review. You will receive an email notification once it is approved or rejected. Please check your email regularly for updates.
            </p>
          </div>
        )}

        {/* Error Messages */}
        {errors.submit && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Form Actions - Match CorporateForm styling exactly */}
        <div className="flex justify-end items-center pt-6 mt-6 space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-gray-700 bg-white px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ht-blue"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`text-sm px-4 py-2 rounded-md ${
              isSubmitting
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-ht-blue text-white hover:bg-ht-blue-dark'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ht-blue`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AmendmentRequestForm;