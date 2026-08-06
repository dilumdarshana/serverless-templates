/**
 * CORS middleware applied to every request.
 */
import { Request, Response } from 'lambda-api';

export default (req: Request, res: Response, next: (err?: any) => void) => {
  // Add default CORS headers for every request
  res.cors({
    methods: 'GET, PATCH, POST, PUT, DELETE, OPTIONS',
    headers: 'Content-Type, Authorization, Content-Length, X-Requested-With',
  });

  const { origin } = req.headers;

  if (process.env.ALLOWED_ORIGINS && process.env.ALLOWED_ORIGINS.indexOf(origin || '') > -1) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (process.env.LAMBDA_STAGE === 'local') {
    res.header('Access-Control-Allow-Origin', '*');
  }

  res.header('Access-Control-Allow-Credentials', 'true');

  next();
};