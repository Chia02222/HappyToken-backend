/**
 * Corporate form validation utilities
 * Extracted from large functions to improve code quality
 */

import { CorporateDetails, Contact } from '../types';
import { isRequired, isValidEmail, isValidPhone, isValidDateRange, isPositiveNumberString } from './validators';

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  fieldToScroll?: string;
}

/**
 * Validates basic corporate information
 */
export const validateBasicCorporateInfo = (formData: CorporateDetails): ValidationResult => {
  if (!isRequired(formData.company_name) || !isRequired(formData.reg_number)) {
    return {
      isValid: false,
      errorMessage: 'Company name and registration number are required.',
      fieldToScroll: !isRequired(formData.company_name) ? 'company_name' : 'reg_number'
    };
  }
  return { isValid: true };
};

/**
 * Validates primary contact information
 */
export const validatePrimaryContact = (formData: CorporateDetails): ValidationResult => {
  const primary = formData.contacts?.[0];
  
  if (!primary || !isRequired(primary.first_name) || !isRequired(primary.last_name)) {
    return {
      isValid: false,
      errorMessage: 'Primary contact first and last name are required.',
      fieldToScroll: !primary || !isRequired(primary.first_name) ? 'first_name' : 'last_name'
    };
  }
  
  if (!isValidEmail(primary.email)) {
    return {
      isValid: false,
      errorMessage: 'Primary contact email is invalid.',
      fieldToScroll: 'email'
    };
  }
  
  if (!isValidPhone(primary.contact_number)) {
    return {
      isValid: false,
      errorMessage: 'Primary contact phone is invalid.',
      fieldToScroll: 'contact_number'
    };
  }
  
  return { isValid: true };
};

/**
 * Validates commercial terms (step 2+)
 */
export const validateCommercialTerms = (formData: CorporateDetails, formStep: number): ValidationResult => {
  if (formStep < 2) return { isValid: true };
  
  if (formData.agreement_from || formData.agreement_to) {
    if (!isValidDateRange(formData.agreement_from, formData.agreement_to)) {
      return {
        isValid: false,
        errorMessage: 'Agreement date range is invalid.',
        fieldToScroll: 'agreementFrom'
      };
    }
  }
  
  const needsCreditLimitCheck = formData.credit_limit != null && String(formData.credit_limit).trim() !== '';
  const needsCustomFeeCheck = formData.custom_feature_fee != null && String(formData.custom_feature_fee).trim() !== '';
  
  if ((needsCreditLimitCheck && !isPositiveNumberString(formData.credit_limit)) || 
      (needsCustomFeeCheck && !isPositiveNumberString(formData.custom_feature_fee))) {
    return {
      isValid: false,
      errorMessage: 'Amounts must be valid non-negative numbers.',
      fieldToScroll: !isPositiveNumberString(formData.credit_limit) ? 'credit_limit' : 'custom_feature_fee'
    };
  }
  
  return { isValid: true };
};

/**
 * Validates the entire corporate form
 */
export const validateCorporateForm = (formData: CorporateDetails, formStep: number): ValidationResult => {
  const basicValidation = validateBasicCorporateInfo(formData);
  if (!basicValidation.isValid) return basicValidation;
  
  const contactValidation = validatePrimaryContact(formData);
  if (!contactValidation.isValid) return contactValidation;
  
  const termsValidation = validateCommercialTerms(formData, formStep);
  if (!termsValidation.isValid) return termsValidation;
  
  return { isValid: true };
};
