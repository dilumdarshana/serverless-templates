/**
 * Build an HTTP Lambda handler backed by a lambda-api router.
 *
 * Every HTTP function creates its OWN router through this factory and
 * registers only its feature's routes. esbuild then bundles only that
 * feature's code into the function, keeping bundles small and letting each
 * function scale / deploy / roll back independently.
 */
import lambdaApi, { API, Request, Response } from 'lambda-api';
import { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import cors from '../middlewares/cors';

export type RouteRegistrar = (api: API) => void;

export const createHttpHandler = (registerRoutes: RouteRegistrar) => {
  const api = lambdaApi({ version: 'v1.0', base: '/v1' });

  api.use(cors);

  // Preflight CORS - every function's API Gateway routes need it
  api.options('/*', (req: Request, res: Response) => {
    res.cors({}).send({});
  });

  registerRoutes(api);

  return (event: APIGatewayProxyEventV2, context: Context) => api.run(event, context);
};
