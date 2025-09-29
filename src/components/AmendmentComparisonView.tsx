'use client';

import React from 'react';

interface AmendmentComparisonViewProps {
  originalData: any;
  amendedData?: any;
  changedFields?: Record<string, any>;
  amendmentDetails: {
    requestedChanges: string;
    amendmentReason: string;
    submittedBy: string;
    status: 'pending' | 'approved' | 'rejected';
  };
  onApprove: () => void;
  onDecline: () => void;
  isReviewMode?: boolean;
}

const AmendmentComparisonView: React.FC<AmendmentComparisonViewProps> = ({
  originalData,
  amendedData: amendedDataProp,
  changedFields,
  amendmentDetails,
  onApprove,
  onDecline,
  isReviewMode = false
}) => {
  // Compute effective amended view: apply changedFields to original when provided; otherwise use amendedData prop
  const amendedData = React.useMemo(() => {
    if (changedFields && typeof changedFields === 'object') {
      const base = Array.isArray(originalData) ? [...originalData] : { ...originalData } as any;
      for (const [key, value] of Object.entries(changedFields)) {
        (base as any)[key] = value;
      }
      return base;
    }
    return amendedDataProp ?? {};
  }, [originalData, changedFields, amendedDataProp]);
  const getFieldValue = (data: any, field: string) => {
    return data?.[field] || '';
  };

  const hasChanged = (field: string) => {
    return getFieldValue(originalData, field) !== getFieldValue(amendedData, field);
  };

  const renderField = (field: string, label: string) => {
    const originalValue = getFieldValue(originalData, field);
    const amendedValue = getFieldValue(amendedData, field);
    const changed = hasChanged(field);

    return (
      <div className={`p-3 rounded-md ${changed ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">{label}</h4>
          {changed && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Changed
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Original</p>
            <p className="text-sm text-gray-900 bg-white p-2 rounded border">
              {originalValue || <span className="text-gray-400 italic">Not provided</span>}
            </p>
          </div>
          
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Amended</p>
            <p className={`text-sm p-2 rounded border ${
              changed 
                ? 'text-blue-900 bg-blue-50 border-blue-200' 
                : 'text-gray-900 bg-white'
            }`}>
              {amendedValue || <span className="text-gray-400 italic">Not provided</span>}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Amendment Review</h1>
        <p className="text-gray-600">Review the requested changes to corporate information</p>
      </div>

      {/* Amendment Details */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">Amendment Request Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requested Changes</label>
            <p className="text-sm text-gray-900 bg-white p-3 rounded border">
              {amendmentDetails.requestedChanges}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Amendment</label>
            <p className="text-sm text-gray-900 bg-white p-3 rounded border">
              {amendmentDetails.amendmentReason}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Submitted By</label>
            <p className="text-sm text-gray-900 bg-white p-3 rounded border">
              {amendmentDetails.submittedBy}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(amendmentDetails.status)}`}>
              {amendmentDetails.status.charAt(0).toUpperCase() + amendmentDetails.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Comparison View */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Field Comparison</h2>
        <p className="text-sm text-gray-600 mb-4">
          Fields with changes are highlighted in yellow. Review each change carefully before making a decision.
        </p>
        
        <div className="space-y-4">
          {renderField('company_name', 'Company Name')}
          {renderField('reg_number', 'Registration Number')}
          {renderField('credit_limit', 'Credit Limit')}
          {renderField('website', 'Website')}
          {renderField('office_address1', 'Office Address 1')}
          {renderField('office_address2', 'Office Address 2')}
          {renderField('postcode', 'Postcode')}
          {renderField('city', 'City')}
          {renderField('state', 'State')}
          {renderField('country', 'Country')}
          {renderField('account_note', 'Account Note')}
        </div>
      </div>

      {/* Review Actions */}
      {isReviewMode && amendmentDetails.status === 'pending' && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Decision</h3>
          <p className="text-sm text-gray-600 mb-4">
            After reviewing the changes, choose to approve or decline this amendment request.
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onDecline}
              className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Decline Amendment
            </button>
            <button
              onClick={onApprove}
              className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Approve Amendment
            </button>
          </div>
        </div>
      )}

      {/* Status Display for Non-Review Mode */}
      {!isReviewMode && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Amendment Status</h3>
          <p className="text-sm text-gray-600">
            This amendment request is currently {amendmentDetails.status}. 
            {amendmentDetails.status === 'pending' && ' It is awaiting review by the CRT team.'}
            {amendmentDetails.status === 'approved' && ' It has been approved and the changes have been applied.'}
            {amendmentDetails.status === 'rejected' && ' It has been declined by the CRT team.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AmendmentComparisonView;


