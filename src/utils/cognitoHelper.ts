/**
 * Cognito helper - wraps Amazon Cognito admin/user operations.
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

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.LAMBDA_REGION });

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

export const deleteCognitoUser = async (email: string, userPoolId: string) => {
  const params = { UserPoolId: userPoolId, Username: email };
  const command = new AdminDeleteUserCommand(params);
  return cognitoClient.send(command);
};

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

export const adminIntiateAuth = async (email: string, password: string, userPoolId: string, clientId: string) => {
  const params = {
    AuthFlow: 'ADMIN_NO_SRP_AUTH' as const,
    UserPoolId: userPoolId,
    ClientId: clientId,
    AuthParameters: { USERNAME: email, PASSWORD: password },
  };
  const command = new AdminInitiateAuthCommand(params);
  return cognitoClient.send(command);
};

export const adminIntiateAuthRefreshToken = async (refreshToken: string, userPoolId: string, clientId: string) => {
  const params = {
    AuthFlow: 'REFRESH_TOKEN_AUTH' as const,
    UserPoolId: userPoolId,
    ClientId: clientId,
    AuthParameters: { REFRESH_TOKEN: refreshToken },
  };
  const command = new AdminInitiateAuthCommand(params);
  return cognitoClient.send(command);
};

export const globalSignOut = async (accessToken: string) => {
  const params = { AccessToken: accessToken };
  const command = new GlobalSignOutCommand(params);
  return cognitoClient.send(command);
};

export const getCognitoUserFromToken = async (token: string) => {
  const params = { AccessToken: token };
  const command = new GetUserCommand(params);
  return cognitoClient.send(command);
};

export const changePassword = async (token: string, previousPassword: string, proposedPassword: string) => {
  const params = {
    AccessToken: token,
    PreviousPassword: previousPassword,
    ProposedPassword: proposedPassword,
  };
  const command = new ChangePasswordCommand(params);
  return cognitoClient.send(command);
};

export interface AuthorizerContext {
  [key: string]: string | boolean | undefined;
}

/**
 * Build the IAM policy document returned by a Lambda custom authorizer.
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