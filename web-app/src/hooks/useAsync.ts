import { useState, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAsync<T>() {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (asyncFunction: () => Promise<T>) => {
      setState({ data: null, loading: true, error: null });
      try {
        const response = await asyncFunction();
        setState({ data: response, loading: false, error: null });
        return response;
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || 'An unexpected error occurred';
        setState({ data: null, loading: false, error: errorMessage });
        throw error;
      }
    },
    []
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
