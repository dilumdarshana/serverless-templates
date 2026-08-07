/**
 * Cognito helper - thin wrappers around Amazon Cognito user/admin operations.
 *
 * Every call takes the values it needs explicitly (userPoolId, clientId, ...)
 * rather than reading from global state, which keeps the functions testable and
 * lets them be reused across user pools.
 *
 * NOTE: only `getCognitoUserFromToken` and `buildAuthorizerResponse` are wired
 * into this template's functions (via the custom authorizer). The rest are
 * provided as a reference library for features that manage users.
 */
import {
  CognitoIdentityProviderClient,
  AdminSetUserPasswordCommand,
  AdminDeleteUserCommand,
  AdminInitiateAuthCommand,
  AdminCreateUserCommand,
  GlobalSignOutCommand,
  GetUserCommand,
  ChangePasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';

// The region is injected via provider.environment (LAMBDA_REGION); in AWS the
// SDK falls back to AWS_REGION when the value is undefined.
const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.LAMBDA_REGION });

/**
 * Set (or reset) a user's password permanently via the admin API.
 * Used after AdminCreateUser so the user can sign in immediately.
 */
export const updateCognitoUserPassword = async (email: string, password: string, userPoolId: string) => {
  const params = {
    Password: password,
    UserPoolId: userPoolId,
    Username: email,
    Permanent: true,
  };
  const command = new AdminSetUserPasswordCommand(params);
  await cognitoClient.send(command);
};

/** Permanently delete a user from the pool. */
export const deleteCognitoUser = async (email: string, userPoolId: string) => {
  const params = { UserPoolId: userPoolId, Username: email };
  const command = new AdminDeleteUserCommand(params);
  return cognitoClient.send(command);
};

/**
 * Create a user in the pool (admin flow) and set an initial permanent password.
 * `MessageAction: SUPPRESS` avoids sending an invitation email.
 */
export const signUpCognitoUser = async (
  email: string,
  password: string,
  userPoolId: string,
  customData: { role: string },
) => {
  const { role } = customData;
  const params = {
    UserPoolId: userPoolId,
    Username: email,
    UserAttributes: [
      { Name: 'email', Value: email },
      { Name: 'email_verified', Value: 'true' },
      { Name: 'custom:role', Value: role },
    ],
    MessageAction: 'SUPPRESS' as const,
  };
  const command = new AdminCreateUserCommand(params);
  const response = await cognitoClient.send(command);

  if (response.User) {
    await updateCognitoUserPassword(email, password, userPoolId);
  }
};

/** Exchange email + password for tokens via the admin auth flow (no SRP). */
export const adminInitiateAuth = async (email: string, password: string, userPoolId: string, clientId: string) => {
  const params = {
    AuthFlow: 'ADMIN_NO_SRP_AUTH' as const,
    UserPoolId: userPoolId,
    ClientId: clientId,
    AuthParameters: { USERNAME: email, PASSWORD: password },
  };
  const command = new AdminInitiateAuthCommand(params);
  return cognitoClient.send(command);
};

/** Refresh an access token using a refresh token. */
export const adminInitiateAuthRefreshToken = async (refreshToken: string, userPoolId: string, clientId: string) => {
  const params = {
    AuthFlow: 'REFRESH_TOKEN_AUTH' as const,
    UserPoolId: userPoolId,
    ClientId: clientId,
    AuthParameters: { REFRESH_TOKEN: refreshToken },
  };
  const command = new AdminInitiateAuthCommand(params);
  return cognitoClient.send(command);
};

/** Invalidate every token issued to the user (global sign out). */
export const globalSignOut = async (accessToken: string) => {
  const params = { AccessToken: accessToken };
  const command = new GlobalSignOutCommand(params);
  return cognitoClient.send(command);
};

/** Resolve the user profile behind an access token (used by the authorizer). */
export const getCognitoUserFromToken = async (token: string) => {
  const params = { AccessToken: token };
  const command = new GetUserCommand(params);
  return cognitoClient.send(command);
};

/** Change the user's password (requires a valid access token). */
export const changePassword = async (token: string, previousPassword: string, proposedPassword: string) => {
  const params = {
    AccessToken: token,
    PreviousPassword: previousPassword,
    ProposedPassword: proposedPassword,
  };
  const command = new ChangePasswordCommand(params);
  return cognitoClient.send(command);
};

/**
 * Context bag forwarded from the custom authorizer to the target Lambda.
 * Values are primitive (string / boolean) because they are embedded in the
 * IAM policy context object, which only supports such types.
 */
export interface AuthorizerContext {
  [key: string]: string | boolean | undefined;
}

/**
 * Build the IAM policy document returned by a Lambda custom authorizer.
 * The `context` object is forwarded verbatim to the target Lambda where it can
 * be read from `event.requestContext.authorizer.lambda`.
 */
export const buildAuthorizerResponse = (
  principleId: string,
  effect: 'Allow' | 'Deny',
  extraData: AuthorizerContext = {},
) => ({
  principalId: principleId,
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: '*',
      },
    ],
  },
  context: extraData,
});

export { cognitoClient };
