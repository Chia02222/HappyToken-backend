"use client";

import React from 'react';
import { CorporateDetails } from '../../types';
import ContentSection from '../common/ContentSection';

interface AmendRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  corporate: CorporateDetails;
  corporateId: string;
  onSubmitAmendment: (corporateId: string, requestedChanges: string, amendmentReason: string) => Promise<void>;
}

const AmendRequestModal: React.FC<AmendRequestModalProps> = ({ isOpen, onClose, corporateId, onSubmitAmendment }) => {
  const [requestedChanges, setRequestedChanges] = React.useState('');
  const [amendmentReason, setAmendmentReason] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] flex flex-col" role="dialog" aria-labelledby="amendment-request-title">
        <div className="flex flex-col min-h-0">
          <div className="flex justify-between items-center px-6 py-3 bg-ht-blue text-white rounded-t-lg">
            <h1 id="amendment-request-title" className="text-center text-lg font-bold">Amendment Request</h1>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">

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
    </div>
  );
};

export default AmendRequestModal;
