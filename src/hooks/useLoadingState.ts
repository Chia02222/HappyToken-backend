/**
 * Custom hook for managing loading states
 * Eliminates duplicate loading state management across components
 */

import { useState, useCallback } from 'react';

export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  setIsLoading: (loading: boolean, message?: string) => void;
  withLoading: <T>(asyncFn: () => Promise<T>, message?: string) => Promise<T>;
}

export const useLoadingState = (): LoadingState => {
  const [isLoading, setIsLoadingState] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>();

  const setIsLoading = useCallback((loading: boolean, message?: string) => {
    setIsLoadingState(loading);
    setLoadingMessage(message);
  }, []);

  const withLoading = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    message?: string
  ): Promise<T> => {
    setIsLoading(true, message);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  return {
    isLoading,
    loadingMessage,
    setIsLoading,
    withLoading
  };
};
