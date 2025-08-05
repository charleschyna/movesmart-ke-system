import { useState, useCallback } from 'react';
import { fetchWithErrorHandling } from '../utils/api';

export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeRequest = useCallback(async (url: string, options?: RequestInit) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchWithErrorHandling(url, options);
      if (response.error) {
        setError(response.message);
        return null;
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { makeRequest, isLoading, error };
};
