/**
 * Main Lambda entry point.
 *
 * `run`          - shared HTTP handler. Every HTTP function in serverless.yml
 *                  points here; `lambda-api` routes the incoming event to the
 *                  right controller based on path + method.
 * `cAuthorizer`  - API Gateway Lambda custom authorizer (validates the Cognito
 *                  token and returns an Allow/Deny IAM policy).
 */
import lambdaApi from 'lambda-api';
import { APIGatewayProxyEventV2, APIGatewayRequestAuthorizerEvent, Context } from 'aws-lambda';
import { load } from './routes';
import cors from './middlewares/cors';
import { doAuth } from './utils/authHelper';

const api = lambdaApi({ version: 'v1.0', base: '/v1' });

api.use(cors);
load(api);

export const run = (event: APIGatewayProxyEventV2, context: Context) => api.run(event, context);

export const cAuthorizer = (event: APIGatewayRequestAuthorizerEvent) => doAuth(event);
