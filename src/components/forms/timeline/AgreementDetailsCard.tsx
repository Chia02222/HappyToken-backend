"use client";

import React from 'react';

interface AgreementDetails {
  title: string;
  executionDate: string;
  effectiveDate: string;
  referenceId: string;
  digitalSignatureStatus: string;
}

interface AgreementDetailsCardProps {
  agreementDetails: AgreementDetails;
}

const AgreementDetailsCard: React.FC<AgreementDetailsCardProps> = ({ agreementDetails }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Fully Executed':
        return 'text-green-600';
      case 'Pending 2nd Approval':
        return 'text-yellow-600';
      case 'Pending 1st Approval':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h4 className="font-semibold text-blue-900 mb-3">Agreement Information</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">Agreement Title:</span>
          <p className="text-gray-900">{agreementDetails.title}</p>
        </div>
        <div>
          <span className="font-medium text-gray-700">Effective Date:</span>
          <p className="text-gray-900">{agreementDetails.effectiveDate}</p>
        </div>
        <div>
          <span className="font-medium text-gray-700">Reference ID:</span>
          <p className="text-gray-900">{agreementDetails.referenceId}</p>
        </div>
        <div className="md:col-span-2">
          <span className="font-medium text-gray-700">Digital Signature Status:</span>
          <p className={`font-semibold ${getStatusColor(agreementDetails.digitalSignatureStatus)}`}>
            {agreementDetails.digitalSignatureStatus}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgreementDetailsCard;
