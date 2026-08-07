import { boom } from './errorHelper';

/**
 * Build and send an error response.
 * @param error - thrown application error
 * @param response - lambda-api response object
 */
export const defaultReject = async (error: Error & { code?: number }, response: any) => {
  const boomError = boom({
    message: error.message,
    statusCode: error.code,
  }).payload;

  const errorResponse = {
    ...boomError,
    stackTrace: error.stack,
  };

  response.status(boomError.statusCode).json(boomError);

  // Only 5xx errors are unexpected and worth reporting
  if (boomError.statusCode >= 500) {
    console.error('API error', errorResponse);
  }
};

/**
 * Send a successful JSON response.
 * @param response - lambda-api response object
 * @param data - payload to return
 */
export const defaultResolve = async (response: any, data: unknown) => {
  response.status(200).json(data);
};
