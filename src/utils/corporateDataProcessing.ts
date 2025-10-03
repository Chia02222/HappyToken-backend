/**
 * Corporate data processing utilities
 * Extracted from large functions to improve code quality
 */

import { CorporateDetails, Contact } from '../types';

/**
 * Processes secondary approver data
 */
export const processSecondaryApprover = (formData: CorporateDetails): CorporateDetails => {
  const updatedFormData = { ...formData };
  const sa = formData.secondary_approver;
  
  if (sa) {
    if (sa.use_existing_contact && sa.selected_contact_id) {
      const contactIndex = updatedFormData.contacts.findIndex(c => c.id === sa.selected_contact_id);
      if (contactIndex !== -1) {
        updatedFormData.contacts[contactIndex] = {
          ...updatedFormData.contacts[contactIndex],
          system_role: 'secondary_approver'
        };
      }
    } else if (!sa.use_existing_contact) {
      const newSecondaryContact: Contact = {
        salutation: sa.salutation || 'Mr',
        first_name: sa.first_name || '',
        last_name: sa.last_name || '',
        contact_number: sa.contact_number || '',
        email: sa.email || '',
        company_role: sa.company_role || '',
        system_role: 'secondary_approver',
      };
      updatedFormData.contacts = [...updatedFormData.contacts, newSecondaryContact];
    }
  }
  
  return updatedFormData;
};

/**
 * Prepares corporate data for API submission
 */
export const prepareCorporateDataForSubmission = (formData: CorporateDetails) => {
  const { contacts, subsidiaries, contactIdsToDelete, subsidiaryIdsToDelete, secondary_approver, ...corporateData } = formData;
  
  return {
    ...corporateData,
    contacts,
    subsidiaries,
    contactIdsToDelete,
    subsidiaryIdsToDelete,
  };
};

/**
 * Determines the approver type based on corporate status
 */
export const determineApproverType = (formData: CorporateDetails): 'first' | 'second' => {
  const hasSecondary = Boolean(formData.secondary_approver_id);
  return hasSecondary ? 'second' : 'first';
};

/**
 * Gets the previous status for amendment resolution
 */
export const getPreviousStatusForAmendment = (formData: CorporateDetails, latestAmendLog: any): string => {
  const from = latestAmendLog?.from_status ?? undefined;
  if (from) return from;
  
  const hasSecondary = Boolean(formData.secondary_approver_id);
  return hasSecondary ? 'Pending 2nd Approval' : 'Pending 1st Approval';
};
