/**
 * Authentication helpers for the API Gateway custom authorizer.
 *
 * A Lambda custom authorizer receives the request before it reaches the
 * function and returns an IAM policy (Allow/Deny) plus a context object that
 * is forwarded to the target Lambda. The Cognito token is validated by calling
 * Cognito's `GetUser` API.
 */
import { APIGatewayRequestAuthorizerEvent } from 'aws-lambda';
import {
  getCognitoUserFromToken,
  buildAuthorizerResponse,
  AuthorizerContext,
} from './cognitoHelper';
import { ROLES } from './constants';
import { InterceptError } from './errorHelper';

export const doAuth = async (event: APIGatewayRequestAuthorizerEvent) => {
  const accessToken = event.headers?.Authorization || '';
  const effect: 'Allow' | 'Deny' = 'Allow';
  let cognitoUserId: string | undefined;

  // Extra data extracted from the Cognito response. This is forwarded to the
  // target Lambda as part of the authorizer context and can be used for
  // feature / role based logic downstream.
  const extraData: AuthorizerContext = {};

  try {
    const { Username: userName, UserAttributes: userAttributes } = await getCognitoUserFromToken(accessToken);
    cognitoUserId = userName;

    // Copy the interesting Cognito attributes into the context bag.
    (userAttributes || []).forEach((element) => {
      const { Name: name, Value: value } = element;
      switch (name) {
        case 'email':
          extraData.email = value;
          break;
        case 'custom:role':
          extraData.role = value;
          break;
        default:
      }
    });

    const { smeId, userId } = event.pathParameters || {};

    // ── EXAMPLE authorization rule ───────────────────────────────────────────
    // Only allow access when the logged-in user owns the SME / user ids in the
    // path. NOTE: for this branch to activate, the Cognito `GetUser` response
    // would have to carry `custom:sme_id` / `custom:user_id` attributes and the
    // switch above would map them into `extraData.sme_id` / `extraData.user_id`.
    // It is kept here to demonstrate path-based authorization.
    if (smeId && smeId === extraData.sme_id) {
      if ((extraData.role === ROLES.ADMIN) || !userId) {
        return buildAuthorizerResponse(cognitoUserId!, effect, extraData);
      }
      if (userId && userId === extraData.user_id) {
        return buildAuthorizerResponse(cognitoUserId!, effect, extraData);
      }
      return buildAuthorizerResponse('user', 'Deny');
    }

    return buildAuthorizerResponse(cognitoUserId!, effect, extraData);
  } catch (error) {
    console.log('Lambda authorizer error', error);
    // Soft-fail pattern: an expired / revoked token still returns Allow, but
    // flags it in the context so the application can decide how to react
    // (e.g. prompt for a re-login). Anything else is rejected outright.
    if (error instanceof Error && error.message === 'Access Token has expired') {
      return buildAuthorizerResponse(cognitoUserId || 'user', 'Allow', { isAuthTokenExpired: true });
    }
    if (error instanceof Error && error.message === 'Access Token has been revoked') {
      return buildAuthorizerResponse(cognitoUserId || 'user', 'Allow', { isUserLoggedOut: true });
    }
    return buildAuthorizerResponse('user', 'Deny');
  }
};

/**
 * Role-based guard for use inside services.
 * Throws HTTP 403 when `currentRole` is not present in `permisionList`.
 */
export const checkAuthorization = (permisionList: string[], currentRole?: string, message = 'AccessDenied') => {
  if (!permisionList.includes(currentRole || '')) {
    throw InterceptError(message, 403);
  }
};
