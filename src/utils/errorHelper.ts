import Boom from '@hapi/boom';

/**
 * Convert an application error into a Boom HTTP error payload.
 *
 * Known 4xx status codes (set via `InterceptError`) map to the matching Boom
 * error so the client receives the intended message. Anything else (undefined
 * or unknown code) becomes a generic 500 with a masked message - the real
 * error is never leaked to the client; it is logged instead (see
 * `defaultReject` in responseHelper.ts).
 *
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
 *
 * Services throw these for expected failures (e.g. `new InterceptError('Todo
 * not found', 404)`); the controller maps them to the matching HTTP response.
 *
 * @param message - error message
 * @param code - HTTP status code (default 500)
 */
export const InterceptError = (message: string, code = 500): Error & { code: number } => {
  const error = new Error(message) as Error & { code: number };
  error.code = code;
  return error;
};
