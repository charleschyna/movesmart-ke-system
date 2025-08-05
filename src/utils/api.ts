import { handleApiError } from './errorHandler';

export const fetchWithErrorHandling = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new HttpError(response.status, response.statusText);
    }
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};
