"use client";

import React from 'react';
import ContentSection from '../../common/ContentSection';

interface TermsConditionsSectionProps {
  isTermsConditionsExpanded: boolean;
  setIsGenericTermsModalOpen: (open: boolean) => void;
  setIsCommercialTermsModalOpen: (open: boolean) => void;
}

const TermsConditionsSection: React.FC<TermsConditionsSectionProps> = ({
  isTermsConditionsExpanded,
  setIsGenericTermsModalOpen,
  setIsCommercialTermsModalOpen,
}) => {
  if (!isTermsConditionsExpanded) return null;

  return (
    <ContentSection title="Terms & Conditions">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer"
             onClick={() => setIsGenericTermsModalOpen(true)}>
          <span className="text-sm font-medium text-gray-900">
            Generic Terms and Conditions
          </span>
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer"
             onClick={() => setIsCommercialTermsModalOpen(true)}>
          <span className="text-sm font-medium text-gray-900">
            Commercial Terms and Conditions
          </span>
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </ContentSection>
  );
};

export default TermsConditionsSection;
