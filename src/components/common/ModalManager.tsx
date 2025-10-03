/**
 * Centralized modal management component
 * Eliminates duplicate modal JSX across components
 */

import React from 'react';
import SuccessModal from '../modals/SuccessModal';
import ErrorMessageModal from '../modals/ErrorMessageModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import { ModalManager } from '../../hooks/useModalManager';

interface ModalManagerProps {
  modalManager: ModalManager;
}

const ModalManagerComponent: React.FC<ModalManagerProps> = ({ modalManager }) => {
  const {
    successModal,
    hideSuccessModal,
    errorModal,
    hideErrorModal,
    confirmationModal,
    hideConfirmationModal
  } = modalManager;

  return (
    <>
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={hideSuccessModal}
        title={successModal.title}
        message={successModal.message}
      />
      
      <ErrorMessageModal
        isOpen={errorModal.isOpen}
        onClose={hideErrorModal}
        message={errorModal.message}
      />
      
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={hideConfirmationModal}
        onConfirm={confirmationModal.onConfirm || (() => {})}
        title={confirmationModal.title}
        message={confirmationModal.message}
      />
    </>
  );
};

export default ModalManagerComponent;
