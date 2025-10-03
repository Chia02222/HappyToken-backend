"use client";

import React from 'react';
import ContentSection from '../../common/ContentSection';
import DisplayField from '../../common/DisplayField';
import InputField from '../../common/InputField';
import SelectField from '../../common/SelectField';
import { CorporateDetails, Contact } from '../../../types';
import { getUniqueCallingCodes } from '../../../data/countries';

interface SecondaryApprovalSectionProps {
  formData: CorporateDetails;
  formMode: 'new' | 'edit' | 'approve' | 'approve-second';
  isCoolingPeriod: boolean;
  isReadOnly: boolean;
  isApproveSecondMode: boolean;
  shouldShowSecondaryAsDisplayOnly: boolean;
  shouldShowDisplayOnly: boolean;
  secondary_approver: any;
  otherContacts: Contact[];
  isSecondaryFromList: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSecondaryApproverChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSecondaryContactSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const SecondaryApprovalSection: React.FC<SecondaryApprovalSectionProps> = ({
  formData,
  formMode,
  isCoolingPeriod,
  isReadOnly,
  isApproveSecondMode,
  shouldShowSecondaryAsDisplayOnly,
  shouldShowDisplayOnly,
  secondary_approver,
  otherContacts,
  isSecondaryFromList,
  handleChange,
  handleSecondaryApproverChange,
  handleSecondaryContactSelect,
}) => {
  const shouldShowSection = (formMode === 'approve' && formData.first_approval_confirmation) || 
                           formMode === 'approve-second' || 
                           (formMode === 'edit' && (formData.status === 'Pending 2nd Approval' || formData.status === 'Cooling Period' || formData.status === 'Approved')) || 
                           formData.status === 'Cooling Period' || 
                           formData.status === 'Approved';

  if (!shouldShowSection) return null;

  return (
    <ContentSection title="Secondary Approval">
      {!shouldShowSecondaryAsDisplayOnly && formData.status !== 'Pending 2nd Approval' && (
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="use_existing_contact"
            name="use_existing_contact"
            checked={!!secondary_approver.use_existing_contact}
            onChange={handleSecondaryApproverChange}
            disabled={isReadOnly}
            className={`h-4 w-4 border-gray-300 rounded focus:ring-ht-gray ${isReadOnly ? 'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100' : ''}`}
          />
          <label htmlFor="use_existing_contact" className="ml-2 block text-sm text-gray-900">
            Use existing contact person for secondary approval
          </label>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {shouldShowSecondaryAsDisplayOnly ? (
          <>
            <DisplayField label="Signatory Name" value={`${secondary_approver.first_name || ''} ${secondary_approver.last_name || ''}`.trim()} borderless />
            <DisplayField label="Company Role" value={secondary_approver.company_role ?? null} borderless />
            <DisplayField label="System Role" value={secondary_approver.system_role ?? null} borderless />
            <DisplayField label="Email Address" value={secondary_approver.email ?? null} borderless />
            <DisplayField label="Contact Number" value={secondary_approver.contact_number ? `${secondary_approver.contact_prefix || '+60'} ${secondary_approver.contact_number}` : ''} borderless />
          </>
        ) : isSecondaryFromList ? (
          <>
            <SelectField
              id="secondaryContactSelect"
              label="Select Contact Person"
              name="selected_contact_id"
              value={secondary_approver.selected_contact_id ?? null}
              onChange={handleSecondaryContactSelect}
              required={formMode === 'approve' || formMode === 'approve-second'}
              disabled={isReadOnly}
            >
              <option value="">Select a contact</option>
              {otherContacts.map((contact: Contact) => (
                <option key={contact.id} value={contact.id}>
                  {`${contact.first_name} ${contact.last_name}`}
                </option>
              ))}
            </SelectField>
            <DisplayField label="Signatory Name" value={`${secondary_approver.last_name || ''} ${secondary_approver.first_name || ''}`.trim()} />
            <DisplayField label="Company Role" value={secondary_approver.company_role ?? null} />
            <DisplayField label="System Role" value={secondary_approver.system_role ?? null} />
            <DisplayField label="Email Address" value={secondary_approver.email ?? null} />
            <DisplayField label="Contact Number" value={secondary_approver.contact_number ? `${secondary_approver.contact_prefix || '+60'} ${secondary_approver.contact_number}` : ''} />
          </>
        ) : (
          <>
            <SelectField
              id="salutation"
              label="Salutation"
              name="salutation"
              value={secondary_approver.salutation ?? 'Mr'}
              onChange={handleSecondaryApproverChange}
              required={formMode === 'approve' || formMode === 'approve-second'}
              disabled={isReadOnly}
            >
              <option value="Mr">Mr</option>
              <option value="Mrs">Mrs</option>
              <option value="Ms">Ms</option>
            </SelectField>
            <div className="md:col-span-1"></div>
            <InputField id="first_name" label="First Name" name="first_name" value={secondary_approver.first_name ?? null} onChange={handleSecondaryApproverChange} required={formMode === 'approve' || formMode === 'approve-second'} disabled={isReadOnly} borderless={isApproveSecondMode} />
            <InputField id="last_name" label="Last Name" name="last_name" value={secondary_approver.last_name ?? null} onChange={handleSecondaryApproverChange} required={formMode === 'approve' || formMode === 'approve-second'} disabled={isReadOnly} borderless={isApproveSecondMode} />
            <InputField id="company_role" label="Company Role" name="company_role" value={secondary_approver.company_role ?? null} onChange={handleSecondaryApproverChange} required={formMode === 'approve' || formMode === 'approve-second'} disabled={isReadOnly} borderless={isApproveSecondMode} />

            <InputField id="email" label="Email Address" name="email" type="email" value={secondary_approver.email ?? null} onChange={handleSecondaryApproverChange} required={formMode === 'approve' || formMode === 'approve-second'} disabled={isReadOnly} borderless={isApproveSecondMode} />
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">*Contact Number</label>
              <div className="flex">
                <select 
                  className={`inline-flex items-center px-3 rounded-l-md ${isReadOnly || isApproveSecondMode ? 'border-0' : 'border border-r-0 border-gray-300'} text-gray-500 text-sm focus:ring-ht-blue focus:border-ht-blue ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'}`}
                  value={secondary_approver.contact_prefix || '+60'}
                  onChange={e => handleSecondaryApproverChange({ target: { name: 'contact_prefix', value: e.target.value } } as React.ChangeEvent<HTMLInputElement>)}
                  disabled={isReadOnly}
                >
                  {getUniqueCallingCodes().map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.code}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  id="contact_number"
                  name="contact_number"
                  value={secondary_approver.contact_number ?? ''}
                  onChange={handleSecondaryApproverChange}
                  disabled={isReadOnly}
                  className={`flex-1 block w-full rounded-none rounded-r-md ${isReadOnly || isApproveSecondMode ? 'border-0' : 'border border-gray-300'} p-2 text-sm focus:ring-ht-blue focus:border-ht-blue ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white dark:bg-white'}`}
                />
              </div>
            </div>
          </>
        )}
      </div>
      <div className="flex items-start mt-6">
        <input 
          type="checkbox" 
          id="second_approval_confirmation" 
          name="second_approval_confirmation" 
          checked={formData.second_approval_confirmation ?? false} 
          onChange={handleChange} 
          disabled={formMode === 'approve' || isCoolingPeriod || (formMode === 'edit' && formData.status === 'Pending 2nd Approval') || shouldShowDisplayOnly}
          className={`h-4 w-4 mt-0.5 border-gray-300 rounded focus:ring-ht-gray ${(formMode === 'approve' || isCoolingPeriod || (formMode === 'edit' && formData.status === 'Pending 2nd Approval') || shouldShowDisplayOnly) ? 'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100' : ''}`} 
        />
        <label htmlFor="second_approval_confirmation" className={`ml-3 block text-xs ${(formMode === 'approve' || isCoolingPeriod || (formMode === 'edit' && formData.status === 'Pending 2nd Approval') || shouldShowDisplayOnly) ? 'text-gray-500' : 'text-gray-800'}`}>
          I hereby confirm that I have read, understood, and agree to the <span className="underline font-bold">Generic Terms and Conditions</span> and <span className="underline font-bold">Commercial Terms and Conditions</span>, and I consent to proceed accordingly.
        </label>
      </div>
    </ContentSection>
  );
};

export default SecondaryApprovalSection;
