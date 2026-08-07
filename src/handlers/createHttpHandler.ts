/**
 * Build an HTTP Lambda handler backed by a lambda-api router.
 *
 * Every HTTP function creates its OWN router through this factory and
 * registers only its feature's routes. esbuild then bundles only that
 * feature's code into the function, keeping bundles small and letting each
 * function scale / deploy / roll back independently.
 *
 * The factory owns the cross-cutting HTTP concerns that every feature needs:
 *   1. the CORS middleware (`api.use`) - runs on EVERY request, including
 *      preflight, and enforces the ALLOWED_ORIGINS allow-list
 *   2. an OPTIONS wildcard route - answers browser preflight requests with a
 *      2xx so the browser proceeds with the actual request
 *   3. feature route registration (provided by the caller)
 */
import lambdaApi, { API, Request, Response } from 'lambda-api';
import { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import cors from '../middlewares/cors';

export type RouteRegistrar = (api: API) => void;

export const createHttpHandler = (registerRoutes: RouteRegistrar) => {
  const api = lambdaApi({ version: 'v1.0', base: '/v1' });

  api.use(cors);

  // Answer OPTIONS (preflight) with a 200. CORS headers are already set by the
  // `cors` middleware above - do NOT call res.cors({}) here, because lambda-api
  // defaults an unset Access-Control-Allow-Origin to `*`, which would bypass the
  // ALLOWED_ORIGINS allow-list for disallowed origins.
  api.options('/*', (req: Request, res: Response) => {
    res.status(200).send({});
  });

  registerRoutes(api);

  return (event: APIGatewayProxyEventV2, context: Context) => api.run(event, context);
};
