"use client";

import React from 'react';
import { CorporateDetails } from '../../types';
import ContentSection from '../common/ContentSection';
import DisplayField from '../common/DisplayField';

interface AmendRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  corporate: CorporateDetails;
  corporateId: string;
  onSubmitAmendment: (corporateId: string, requestedChanges: string, amendmentReason: string) => Promise<void>;
}

const AmendRequestModal: React.FC<AmendRequestModalProps> = ({ isOpen, onClose, corporate, corporateId, onSubmitAmendment }) => {
  const [requestedChanges, setRequestedChanges] = React.useState('');
  const [amendmentReason, setAmendmentReason] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen) return null;

  const primaryContact = corporate.contacts?.[0] || {};
  const secondaryContact = corporate.contacts?.[1] || {};

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-8 md:p-12">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-center text-xl font-bold text-ht-gray-dark">Amendment Request</h1>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <p className="text-xs text-gray-600 mb-6 p-4 bg-gray-50 border rounded-md">
            Current corporate account details for <strong>{corporate.company_name || '[Company Name]'}</strong> (Registration Number: {corporate.reg_number || 'XXXXXXXX-X'}). 
            Please review the information below and specify what changes you would like to request.
          </p>

          <ContentSection title="Company Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-4">
                <DisplayField label="Company Name" value={corporate.company_name} />
                <DisplayField label="Official Registration Number" value={corporate.reg_number} />
                <DisplayField label="Office Address" value={`${corporate.office_address1}${corporate.office_address2 ? `, ${corporate.office_address2}` : ''}`} />
                <DisplayField label="Postcode" value={corporate.postcode} />
                <DisplayField label="City" value={corporate.city} />
                <DisplayField label="State" value={corporate.state} />
                <DisplayField label="Country" value={corporate.country} />
                <DisplayField label="Website" value={corporate.website} />
                <DisplayField label="Account Note" value={corporate.account_note} />
              </div>
              <div className="space-y-4">
                <DisplayField label="Agreement Duration" value={corporate.agreement_from && corporate.agreement_to ? `${corporate.agreement_from} to ${corporate.agreement_to}` : ''} />
                <DisplayField label="Credit Limit" value={`MYR ${corporate.credit_limit}`} />
                <DisplayField label="Credit Terms" value={`${corporate.credit_terms} days`} />
                <DisplayField label="Transaction Fees Rate" value={`${corporate.transaction_fee}%`} />
                <DisplayField label="Late Payment Interest" value={`${corporate.late_payment_interest}%`} />
                <DisplayField label="White Labeling Fee (*only when request)" value={corporate.white_labeling_fee ? `${corporate.white_labeling_fee}%` : 'N/A'} />
                <DisplayField label="Custom Feature Request Fee (*only when request)" value={`MYR ${corporate.custom_feature_fee}`} />
              </div>
            </div>
          </ContentSection>

          <ContentSection title="Primary Contact">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <DisplayField label="Signatory Name" value={`${primaryContact.first_name || ''} ${primaryContact.last_name || ''}`.trim()} />
              <DisplayField label="Company Role" value={primaryContact.company_role} />
              <DisplayField label="System Role" value={primaryContact.system_role} />
              <DisplayField label="Email Address" value={primaryContact.email} />
              <DisplayField label="Contact Number" value={primaryContact.contact_number ? `+60 ${primaryContact.contact_number}` : ''} />
            </div>
          </ContentSection>

          {secondaryContact && (secondaryContact.first_name || secondaryContact.last_name) && (
            <ContentSection title="Secondary Contact">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <DisplayField label="Signatory Name" value={`${secondaryContact.first_name || ''} ${secondaryContact.last_name || ''}`.trim()} />
                <DisplayField label="Company Role" value={secondaryContact.company_role} />
                <DisplayField label="System Role" value={secondaryContact.system_role} />
                <DisplayField label="Email Address" value={secondaryContact.email} />
                <DisplayField label="Contact Number" value={secondaryContact.contact_number ? `+60 ${secondaryContact.contact_number}` : ''} />
              </div>
            </ContentSection>
          )}

          <ContentSection title="Amendment Request Details">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  What changes would you like to request?
                </label>
                <textarea
                  value={requestedChanges}
                  onChange={(e) => setRequestedChanges(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows={4}
                  placeholder="Please describe the specific changes you would like to make to this corporate account..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Reason for amendment
                </label>
                <textarea
                  value={amendmentReason}
                  onChange={(e) => setAmendmentReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows={3}
                  placeholder="Please provide the reason for requesting these changes..."
                />
              </div>
            </div>
          </ContentSection>

          <div className="flex justify-end items-center pt-6 border-t mt-6 space-x-4">
            <button
              onClick={onClose}
              className="text-sm text-gray-700 bg-white px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ht-blue"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (!requestedChanges.trim() || !amendmentReason.trim()) {
                  alert('Please fill in both the requested changes and reason for amendment.');
                  return;
                }
                
                setIsSubmitting(true);
                try {
                  await onSubmitAmendment(corporateId, requestedChanges, amendmentReason);
                  setRequestedChanges('');
                  setAmendmentReason('');
                  onClose();
                } catch (error) {
                  console.error('Failed to submit amendment request:', error);
                  alert('Failed to submit amendment request. Please try again.');
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
              className="text-sm bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Amendment Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmendRequestModal;
