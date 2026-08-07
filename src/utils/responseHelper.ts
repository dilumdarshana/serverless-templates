import { boom } from './errorHelper';
import { Response } from 'lambda-api';

/**
 * Build and send an error response.
 * @param error - thrown application error
 * @param response - lambda-api response object
 */
export const defaultReject = async (error: unknown, response: Response) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  const statusCode = (error as { code?: number } | null)?.code;

  const boomError = boom({
    message,
    statusCode,
  }).payload;

  const errorResponse = {
    ...boomError,
    stackTrace: error instanceof Error ? error.stack : undefined,
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
export const defaultResolve = async (response: Response, data: unknown) => {
  response.status(200).json(data);
};
