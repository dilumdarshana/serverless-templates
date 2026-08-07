/**
 * Lambda custom authorizer entry point.
 *
 * `cAuthorizer` - API Gateway Lambda custom authorizer (validates the Cognito
 * token and returns an Allow/Deny IAM policy). HTTP function entries live in
 * `src/functions/<feature>/handler.ts`, each with its own lambda-api router.
 */
import { APIGatewayRequestAuthorizerEvent } from 'aws-lambda';
import { doAuth } from './utils/authHelper';

export const cAuthorizer = (event: APIGatewayRequestAuthorizerEvent) => doAuth(event);
