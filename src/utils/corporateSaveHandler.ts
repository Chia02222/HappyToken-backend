/**
 * Corporate save handler utilities
 * Extracted from large functions to improve code quality
 */

import { CorporateDetails, CorporateStatus } from '../types';
import { updateCorporate, createCorporate, updateCorporateStatus } from '../services/api';
import { processSecondaryApprover, prepareCorporateDataForSubmission } from './corporateDataProcessing';
import { getApproverForEmail } from './emailHandling';
import { sendEmailToFirstApprover, sendEmailToSecondApprover } from './emailHandling';
import { logError } from './logger';
import { errorHandler } from './errorHandler';

export interface SaveCorporateResult {
  success: boolean;
  error?: string;
  savedCorporateId?: string;
}

export interface SaveCorporateParams {
  formData: CorporateDetails;
  action: 'submit' | 'sent' | 'save';
  formMode: 'new' | 'edit' | 'approve' | 'approve-second';
  corporateId: string;
  setSuccessModalContent: (content: { title: string; message: string }) => void;
  setShouldCloseOnSuccessClose: (close: boolean) => void;
  setIsSuccessModalVisible: (visible: boolean) => void;
  setErrorModalContent: (content: string) => void;
  setIsErrorModalVisible: (visible: boolean) => void;
  handleCloseCorporateForm: () => void;
}

/**
 * Processes form data based on mode and action
 */
export const processFormDataForSave = (
  formData: CorporateDetails, 
  action: 'submit' | 'sent' | 'save',
  formMode: 'new' | 'edit' | 'approve' | 'approve-second'
): CorporateDetails => {
  let updatedFormData = { ...formData };

  if (formMode === 'approve-second' && action === 'submit') {
    updatedFormData.second_approval_confirmation = true;
    updatedFormData = processSecondaryApprover(updatedFormData);
  } else if (formMode === 'approve' && action === 'submit') {
    updatedFormData.first_approval_confirmation = true;
    updatedFormData = processSecondaryApprover(updatedFormData);
  }

  return updatedFormData;
};

/**
 * Saves corporate data to the backend
 */
export const saveCorporateDataToBackend = async (
  formData: CorporateDetails,
  corporateId: string
): Promise<string> => {
  const dataToSend = prepareCorporateDataForSubmission(formData);
  let savedCorporateId = corporateId;

  if (corporateId && corporateId !== 'new') {
    await updateCorporate(corporateId, dataToSend);
  } else {
    try {
      const newCorporate = await createCorporate(dataToSend);
      savedCorporateId = newCorporate.uuid;
    } catch (error) {
      const errorMessage = errorHandler.handleApiError(error as Error, { component: 'CorporateSaveHandler', action: 'createCorporate' });
      logError('Failed to create corporate', { error: errorMessage }, 'CorporateSaveHandler');
      throw error;
    }
  }

  return savedCorporateId;
};

/**
 * Handles email sending for approval workflow
 */
export const handleApprovalEmailSending = async (
  savedCorporateId: string,
  formData: CorporateDetails
): Promise<{ success: boolean; error?: string; newStatus?: string }> => {
  try {
    const approver = getApproverForEmail(formData);
    
    if (approver === 'first') {
      const emailResult = await sendEmailToFirstApprover(savedCorporateId, formData);
      if (!emailResult.success) {
        return { success: false, error: emailResult.error };
      }
    } else {
      const emailResult = await sendEmailToSecondApprover(savedCorporateId, formData);
      if (!emailResult.success) {
        return { success: false, error: emailResult.error };
      }
    }

    const newStatus = approver === 'first' ? 'Pending 1st Approval' : 'Pending 2nd Approval';
    await updateCorporateStatus(savedCorporateId, newStatus);
    
    return { success: true, newStatus };
  } catch (error) {
    const errorMessage = errorHandler.handleApiError(error as Error, { component: 'CorporateSaveHandler', action: 'sendApprovalEmail' });
    logError('Error sending approval email', { error: errorMessage }, 'CorporateSaveHandler');
    return { success: false, error: errorMessage };
  }
};

/**
 * Handles approval submission
 */
export const handleApprovalSubmission = async (
  savedCorporateId: string,
  formData: CorporateDetails,
  formMode: 'new' | 'edit' | 'approve' | 'approve-second'
): Promise<{ success: boolean; error?: string; newStatus?: string }> => {
  try {
    if (formMode === 'approve') {
      const hasSecondary = Boolean(formData.secondary_approver_id);
      const newStatus = hasSecondary ? 'Pending 2nd Approval' : 'Approved';
      await updateCorporateStatus(savedCorporateId, newStatus);
      return { success: true, newStatus };
    } else if (formMode === 'approve-second') {
      await updateCorporateStatus(savedCorporateId, 'Approved');
      return { success: true, newStatus: 'Approved' };
    }
    
    return { success: true };
  } catch (error) {
    const errorMessage = errorHandler.handleApiError(error as Error, { component: 'CorporateSaveHandler', action: 'submitApproval' });
    logError('Error submitting approval', { error: errorMessage }, 'CorporateSaveHandler');
    return { success: false, error: errorMessage };
  }
};
