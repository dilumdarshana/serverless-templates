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
import { Context } from 'aws-lambda';
import { load } from './routes';
import cors from './middlewares/cors';
import { doAuth } from './utils/authHelper';

const api = lambdaApi({ version: 'v1.0', base: '/v1' });

api.use(cors);
load(api);

export const run = async (event: any, context: Context) => {
  try {
    return api.run(event, context);
  } catch (err) {
    throw new Error('Unknown error occurred, handler.js');
  }
};

export const cAuthorizer = async (event: any) => doAuth(event);