"use client";

import React from 'react';
import ContentSection from '../../common/ContentSection';
import DisplayField from '../../common/DisplayField';
import { CorporateDetails } from '../../../types';

interface CommercialTermsSectionProps {
  formData: CorporateDetails;
  isTermsConditionsExpanded: boolean;
  setIsTermsConditionsExpanded: (expanded: boolean) => void;
}

const CommercialTermsSection: React.FC<CommercialTermsSectionProps> = ({
  formData,
  isTermsConditionsExpanded,
  setIsTermsConditionsExpanded,
}) => {
  return (
    <ContentSection title="Commercial Terms">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div className="space-y-4">
          <DisplayField label="Company Name" value={formData.company_name} borderless />
          <DisplayField label="Official Registration Number" value={formData.reg_number} borderless />
          <DisplayField label="Office Address" value={`${formData.office_address1}${formData.office_address2 ? `, ${formData.office_address2}` : ''}`} borderless />
          <DisplayField label="Postcode" value={formData.postcode} borderless />
          <DisplayField label="City" value={formData.city} borderless />
          <DisplayField label="State" value={formData.state} borderless />
          <DisplayField label="Country" value={formData.country} borderless />
          <DisplayField label="Website" value={formData.website} borderless />
          <DisplayField label="Account Note" value={formData.account_note} borderless />
        </div>
        <div className="space-y-4">
          <DisplayField label="Agreement Duration" value={formData.agreement_from && formData.agreement_to ? `${formData.agreement_from.split('T')[0]} to ${formData.agreement_to.split('T')[0]}` : ''} borderless />
          <DisplayField label="Credit Limit" value={`MYR ${formData.credit_limit}`} borderless />
          <DisplayField label="Credit Terms" value={`${formData.credit_terms} days`} borderless />
          <DisplayField label="Transaction Fees Rate" value={`${formData.transaction_fee}%`} borderless />
          <DisplayField label="Late Payment Interest" value={`${formData.late_payment_interest}%`} borderless />
          <DisplayField label="White Labeling Fee (*only when request)" value={formData.white_labeling_fee ? `${formData.white_labeling_fee}%` : 'N/A'} borderless />
          <DisplayField label="Custom Feature Request Fee (*only when request)" value={`MYR ${formData.custom_feature_fee}`} borderless />
        </div>
      </div>
      
      {/* More Button placed under Commercial Terms - right aligned */}
      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={() => setIsTermsConditionsExpanded(!isTermsConditionsExpanded)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-ht-blue rounded-md px-3 py-2 border border-gray-300 hover:bg-gray-50"
        >
          More
          <svg className={`ml-1 w-4 h-4 transition-transform ${isTermsConditionsExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </ContentSection>
  );
};

export default CommercialTermsSection;
