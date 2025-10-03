/**
 * Custom hook for form validation
 * Eliminates duplicate validation patterns across forms
 */

import { useState, useCallback } from 'react';
import { ZodSchema } from 'zod';

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidation {
  errors: Record<string, string>;
  isValid: boolean;
  validateField: (field: string, value: any, schema?: ZodSchema) => boolean;
  validateForm: (data: any, schema?: ZodSchema) => boolean;
  setFieldError: (field: string, message: string) => void;
  clearFieldError: (field: string) => void;
  clearAllErrors: () => void;
}

export const useFormValidation = (): FormValidation => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((field: string, value: any, schema?: ZodSchema): boolean => {
    if (!schema) return true;
    
    try {
      schema.parse(value);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return true;
    } catch (error: any) {
      const errorMessage = error.errors?.[0]?.message || 'Invalid value';
      setErrors(prev => ({ ...prev, [field]: errorMessage }));
      return false;
    }
  }, []);

  const validateForm = useCallback((data: any, schema?: ZodSchema): boolean => {
    if (!schema) return true;
    
    try {
      schema.parse(data);
      setErrors({});
      return true;
    } catch (error: any) {
      const newErrors: Record<string, string> = {};
      error.errors?.forEach((err: any) => {
        const field = err.path?.join('.') || 'form';
        newErrors[field] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
  }, []);

  const setFieldError = useCallback((field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    validateField,
    validateForm,
    setFieldError,
    clearFieldError,
    clearAllErrors
  };
};
