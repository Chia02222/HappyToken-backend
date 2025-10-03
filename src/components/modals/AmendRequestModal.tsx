"use client";

import React from 'react';

interface AmendRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  amendmentData?: {
    timestamp?: string;
    submittedBy?: string;
    submittedByRole?: string;
  };
  onViewAmendment?: () => void;
}

const AmendRequestModal: React.FC<AmendRequestModalProps> = ({ 
  isOpen, 
  onClose, 
  amendmentData,
  onViewAmendment
}) => {

  if (!isOpen) return null;

  // Helper function to format timestamp
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 flex flex-col" role="dialog" aria-labelledby="amendment-request-title">
        <div className="flex flex-col min-h-0">
          <div className="flex justify-between items-center px-6 py-3 bg-ht-blue text-white rounded-t-lg">
            <h1 id="amendment-request-title" className="text-center text-lg font-bold">
              Amendment Request
            </h1>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">

          {/* Amendment Request Notice Content */}
          <div className="mb-4">
            <div className="font-semibold mb-1 text-gray-900">Amendment Requested</div>
            <div className="text-sm text-gray-600 mb-1">
              {formatTimestamp(amendmentData?.timestamp)}
            </div>
            {amendmentData?.submittedBy && (
              <div className="text-sm text-gray-600 mb-2">
                Amendment request submitted by: {amendmentData.submittedBy} {amendmentData.submittedByRole ? `(${amendmentData.submittedByRole})` : ''}
              </div>
            )}
          </div>

          <div className="flex justify-end items-center pt-6 border-t mt-6 space-x-4">
            <button
              onClick={() => {
                onClose();
                onViewAmendment?.();
              }}
              className="text-sm bg-ht-blue text-white px-4 py-2 rounded-md hover:bg-ht-blue-dark focus:outline-none focus:ring-2 focus:ring-ht-blue"
            >
              View Amendment
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmendRequestModal;
