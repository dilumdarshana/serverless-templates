/**
 * CORS middleware applied to every request.
 *
 * - local stage: allow any origin
 * - otherwise: only reflect origins present in ALLOWED_ORIGINS
 * - unlisted origins get no Access-Control-Allow-Origin header -> the
 *   browser blocks the request. Credentials are only sent alongside a
 *   reflected (specific) origin, never with a `*` wildcard, which the
 *   CORS spec forbids.
 */
import { Middleware } from 'lambda-api';

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim());

const cors: Middleware = (req, res, next) => {
  const origin = req.headers.origin;

  if (process.env.LAMBDA_STAGE === 'local') {
    res.cors({ origin: '*' });
  } else if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.cors({ origin, credentials: true });
  }

  next();
};

export default cors;
