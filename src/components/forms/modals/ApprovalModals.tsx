"use client";

import React from 'react';
import ErrorMessageModal from '../../modals/ErrorMessageModal';
import ChangeStatusModal from '../../modals/ChangeStatusModal';
import SuccessModal from '../../modals/SuccessModal';
import { CorporateDetails, CorporateStatus } from '../../../types';
import { logError } from '../../../utils/logger';
import { errorHandler } from '../../../utils/errorHandler';

interface ApprovalModalsProps {
  showValidationError: boolean;
  setShowValidationError: (show: boolean) => void;
  validationErrorMessage: string;
  
  isRejectModalOpen: boolean;
  setIsRejectModalOpen: (open: boolean) => void;
  formData: CorporateDetails;
  updateStatus: (id: string, status: CorporateStatus, note?: string) => Promise<void>;
  isRejecting: boolean;
  setIsRejecting: (rejecting: boolean) => void;
  
  isRejectSuccessModalOpen: boolean;
  setIsRejectSuccessModalOpen: (open: boolean) => void;
}

const ApprovalModals: React.FC<ApprovalModalsProps> = ({
  showValidationError,
  setShowValidationError,
  validationErrorMessage,
  isRejectModalOpen,
  setIsRejectModalOpen,
  formData,
  updateStatus,
  isRejecting,
  setIsRejecting,
  isRejectSuccessModalOpen,
  setIsRejectSuccessModalOpen,
}) => {
  return (
    <>
      <ErrorMessageModal
        isOpen={showValidationError}
        onClose={() => setShowValidationError(false)}
        message={validationErrorMessage}
      />
      
      <ChangeStatusModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        corporate={formData}
        targetStatus={'Rejected'}
        onSave={async (corporateId, status, note) => {
          setIsRejecting(true);
          try {
            await updateStatus(corporateId, status, note);
            setIsRejectModalOpen(false);
            setIsRejectSuccessModalOpen(true);
          } catch (error) {
            const errorMessage = errorHandler.handleApiError(error as Error, { component: 'ApprovalModals', action: 'rejection' });
            logError('Rejection failed', { error: errorMessage }, 'ApprovalModals');
            setIsRejecting(false);
          }
        }}
        isRejecting={true}
      />
      
      <SuccessModal
        isOpen={isRejectSuccessModalOpen}
        onClose={() => {
          setIsRejectSuccessModalOpen(false);
          setIsRejecting(false);
          window.location.reload();
        }}
        title="Rejection Successful"
        message="The corporate has been successfully rejected."
      />
    </>
  );
};

export default ApprovalModals;
