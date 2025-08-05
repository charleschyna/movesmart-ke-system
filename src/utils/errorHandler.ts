export class HttpError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

export const handleApiError = (error: any) => {
  if (error instanceof HttpError) {
    console.error(`HTTP Error ${error.statusCode}: ${error.message}`);
    return {
      error: true,
      message: error.message,
      statusCode: error.statusCode
    };
  }
  
  console.error('Internal Server Error:', error);
  return {
    error: true,
    message: 'Internal Server Error',
    statusCode: 500
  };
};
