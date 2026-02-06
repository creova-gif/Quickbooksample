/**
 * useApi Hook
 * 
 * React hook for API calls with loading, error states
 * Makes it easy to call backend services from components
 * 
 * Usage:
 * const { data, loading, error, execute } = useApi(getTransactions);
 * 
 * useEffect(() => {
 *   execute();
 * }, []);
 */

import { useState, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T, Args extends any[]> extends UseApiState<T> {
  execute: (...args: Args) => Promise<T | undefined>;
  reset: () => void;
}

export function useApi<T, Args extends any[] = []>(
  apiFunction: (...args: Args) => Promise<T>,
  immediate = false
): UseApiReturn<T, Args> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(
    async (...args: Args): Promise<T | undefined> => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await apiFunction(...args);
        setState({ data: response, loading: false, error: null });
        return response;
      } catch (err: any) {
        const errorMessage = err?.message || 'An error occurred';
        setState({ data: null, loading: false, error: errorMessage });
        console.error('API Error:', err);
        return undefined;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for mutations (POST, PUT, DELETE)
 * Automatically shows success/error toasts
 */
export function useMutation<T, Args extends any[] = []>(
  apiFunction: (...args: Args) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  }
): UseApiReturn<T, Args> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: Args): Promise<T | undefined> {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await apiFunction(...args);
        setState({ data: response, loading: false, error: null });
        options?.onSuccess?.(response);
        return response;
      } catch (err: any) {
        const errorMessage = err?.message || 'An error occurred';
        setState({ data: null, loading: false, error: errorMessage });
        options?.onError?.(errorMessage);
        console.error('Mutation Error:', err);
        return undefined;
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
