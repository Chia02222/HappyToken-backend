/**
 * Custom hook for handling API errors consistently
 * Eliminates duplicate error handling patterns across components
 */

import { useCallback } from 'react';
import { errorHandler } from '../utils/errorHandler';
import { logError } from '../utils/logger';

export interface ApiErrorHandler {
  handleApiError: (error: Error, context: { component: string; action: string; [key: string]: any }) => string;
  handleApiCall: <T>(
    apiCall: () => Promise<T>,
    context: { component: string; action: string; [key: string]: any },
    onError?: (error: string) => void
  ) => Promise<T | null>;
}

export const useApiErrorHandler = (): ApiErrorHandler => {
  const handleApiError = useCallback((error: Error, context: { component: string; action: string; [key: string]: any }): string => {
    const errorMessage = errorHandler.handleApiError(error, context);
    logError(`API Error in ${context.component}`, { error: errorMessage, context }, context.component);
    return errorMessage;
  }, []);

  const handleApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    context: { component: string; action: string; [key: string]: any },
    onError?: (error: string) => void
  ): Promise<T | null> => {
    try {
      return await apiCall();
    } catch (error) {
      const errorMessage = handleApiError(error as Error, context);
      if (onError) {
        onError(errorMessage);
      }
      return null;
    }
  }, [handleApiError]);

  return {
    handleApiError,
    handleApiCall
  };
};
