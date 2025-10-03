/**
 * Email handling utilities
 * Extracted from large functions to improve code quality
 */

import { CorporateDetails } from '../types';
import { sendEcommericialTermlink, sendAmendmentEmail, sendAmendRejectEmail } from '../services/api';

export interface EmailResult {
  success: boolean;
  error?: string;
}

/**
 * Sends email to first approver
 */
export const sendEmailToFirstApprover = async (
  corporateId: string, 
  formData: CorporateDetails
): Promise<EmailResult> => {
  try {
    await sendEcommericialTermlink(corporateId, 'first');
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email to first approver' 
    };
  }
};

/**
 * Sends email to second approver
 */
export const sendEmailToSecondApprover = async (
  corporateId: string, 
  formData: CorporateDetails
): Promise<EmailResult> => {
  try {
    await sendEcommericialTermlink(corporateId, 'second');
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email to second approver' 
    };
  }
};

/**
 * Sends amendment email
 */
export const sendAmendmentEmailToApprover = async (
  corporateId: string
): Promise<EmailResult> => {
  try {
    await sendAmendmentEmail(corporateId);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send amendment email' 
    };
  }
};

/**
 * Sends amendment rejection email
 */
export const sendAmendmentRejectionEmail = async (
  corporateId: string, 
  note?: string
): Promise<EmailResult> => {
  try {
    await sendAmendRejectEmail(corporateId, note);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send amendment rejection email' 
    };
  }
};

/**
 * Determines which approver to send email to based on corporate status
 */
export const getApproverForEmail = (formData: CorporateDetails): 'first' | 'second' => {
  const hasSecondary = Boolean(formData.secondary_approver_id);
  return hasSecondary ? 'second' : 'first';
};
