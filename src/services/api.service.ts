import { handleApiError } from '../utils/errorHandler';

export class ApiService {
  async makeRequest(endpoint: string, options?: RequestInit) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  }
}
