"use client";

import React from 'react';
import ContentSection from '../../common/ContentSection';
import DisplayField from '../../common/DisplayField';
import { CorporateDetails, Contact } from '../../../types';

interface FirstApprovalSectionProps {
  formData: CorporateDetails;
  primaryContact: Contact;
  formMode: 'new' | 'edit' | 'approve' | 'approve-second';
  isCoolingPeriod: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const FirstApprovalSection: React.FC<FirstApprovalSectionProps> = ({
  formData,
  primaryContact,
  formMode,
  isCoolingPeriod,
  handleChange,
}) => {
  return (
    <ContentSection title="First Approval">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <DisplayField label="Signatory Name" value={`${primaryContact.first_name || ''} ${primaryContact.last_name || ''}`.trim()} borderless />
        <DisplayField label="Company Role" value={primaryContact.company_role} borderless />
        <DisplayField label="System Role" value={primaryContact.system_role} borderless />
        <DisplayField label="Email Address" value={primaryContact.email} borderless />
        <DisplayField label="Contact Number" value={primaryContact.contact_number ? `${primaryContact.contact_prefix || '+60'} ${primaryContact.contact_number}` : ''} borderless />
      </div>
      <div className="flex items-start mt-6">
        <input 
          type="checkbox" 
          id="first_approval_confirmation" 
          name="first_approval_confirmation" 
          checked={formData.first_approval_confirmation ?? false} 
          onChange={handleChange} 
          disabled={formMode === 'new' || formMode === 'edit' || formMode === 'approve-second' || isCoolingPeriod}
          className={`h-4 w-4 mt-0.5 border-gray-300 rounded focus:ring-ht-gray ${(formMode === 'new' || formMode === 'edit' || formMode === 'approve-second' || isCoolingPeriod) ? 'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100' : ''}`} 
        />
        <label htmlFor="first_approval_confirmation" className={`ml-3 block text-xs ${(formMode === 'new' || formMode === 'edit' || formMode === 'approve-second' || isCoolingPeriod) ? 'text-gray-500' : 'text-gray-800'}`}>
          I hereby confirm that I have read, understood, and agree to the <span className="underline font-bold">Generic Terms and Conditions</span> and <span className="underline font-bold">Commercial Terms and Conditions</span>, and I consent to proceed accordingly.
        </label>
      </div>
    </ContentSection>
  );
};

export default FirstApprovalSection;
