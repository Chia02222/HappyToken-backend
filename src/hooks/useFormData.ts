/**
 * Custom hook for managing form data
 * Eliminates duplicate form state management patterns
 */

import { useState, useCallback } from 'react';

export interface FormDataManager<T> {
  formData: T;
  setFormData: (data: T | ((prev: T) => T)) => void;
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
  updateFields: (updates: Partial<T>) => void;
  resetForm: (initialData: T) => void;
  hasChanges: boolean;
  originalData: T;
}

export const useFormData = <T>(initialData: T): FormDataManager<T> => {
  const [formData, setFormData] = useState<T>(initialData);
  const [originalData] = useState<T>(initialData);

  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateFields = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const resetForm = useCallback((newInitialData: T) => {
    setFormData(newInitialData);
  }, []);

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  return {
    formData,
    setFormData,
    updateField,
    updateFields,
    resetForm,
    hasChanges,
    originalData
  };
};
