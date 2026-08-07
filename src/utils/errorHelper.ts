import Boom from '@hapi/boom';

/**
 * Convert an application error into a Boom HTTP error payload.
 * @param error - error carrying an HTTP status code and message
 */
export const boom = (error: { statusCode?: number; message?: string }) => {
  switch (error.statusCode) {
    case 400:
      return Boom.badRequest(error.message).output;
    case 401:
      return Boom.unauthorized(error.message).output;
    case 403:
      return Boom.forbidden(error.message).output;
    case 404:
      return Boom.notFound(error.message).output;
    case 405:
      return Boom.methodNotAllowed(error.message).output;
    case 406:
      return Boom.notAcceptable(error.message).output;
    case 408:
      return Boom.clientTimeout(error.message).output;
    case 414:
      return Boom.uriTooLong(error.message).output;
    case 415:
      return Boom.unsupportedMediaType(error.message).output;
    case 422:
      return Boom.badData(error.message).output;
    default:
      return Boom.badImplementation('Unknown error').output;
  }
};

/**
 * Build a custom error carrying an HTTP status code.
 * @param message - error message
 * @param code - HTTP status code (default 500)
 */
export const InterceptError = (message: string, code = 500): Error & { code: number } => {
  const error = new Error(message) as Error & { code: number };
  error.code = code;
  return error;
};
