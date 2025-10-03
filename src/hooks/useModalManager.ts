/**
 * Custom hook for managing modal state
 * Eliminates duplicate modal state management across components
 */

import { useState, useCallback } from 'react';

export interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
}

export interface ModalManager {
  // Success Modal
  successModal: ModalState;
  showSuccessModal: (title: string, message: string) => void;
  hideSuccessModal: () => void;
  
  // Error Modal
  errorModal: ModalState;
  showErrorModal: (message: string) => void;
  hideErrorModal: () => void;
  
  // Confirmation Modal
  confirmationModal: ModalState & { onConfirm?: () => void };
  showConfirmationModal: (title: string, message: string, onConfirm: () => void) => void;
  hideConfirmationModal: () => void;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useModalManager = (): ModalManager => {
  const [successModal, setSuccessModal] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: ''
  });
  
  const [errorModal, setErrorModal] = useState<ModalState>({
    isOpen: false,
    title: 'Error',
    message: ''
  });
  
  const [confirmationModal, setConfirmationModal] = useState<ModalState & { onConfirm?: () => void }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: undefined
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const showSuccessModal = useCallback((title: string, message: string) => {
    setSuccessModal({ isOpen: true, title, message });
  }, []);

  const hideSuccessModal = useCallback(() => {
    setSuccessModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const showErrorModal = useCallback((message: string) => {
    setErrorModal({ isOpen: true, title: 'Error', message });
  }, []);

  const hideErrorModal = useCallback(() => {
    setErrorModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const showConfirmationModal = useCallback((title: string, message: string, onConfirm: () => void) => {
    setConfirmationModal({ isOpen: true, title, message, onConfirm });
  }, []);

  const hideConfirmationModal = useCallback(() => {
    setConfirmationModal(prev => ({ ...prev, isOpen: false, onConfirm: undefined }));
  }, []);

  return {
    successModal,
    showSuccessModal,
    hideSuccessModal,
    errorModal,
    showErrorModal,
    hideErrorModal,
    confirmationModal,
    showConfirmationModal,
    hideConfirmationModal,
    isLoading,
    setIsLoading
  };
};
