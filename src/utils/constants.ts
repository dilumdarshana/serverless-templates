/**
 * Global application constants.
 *
 * Table / queue / bucket names are suffixed with the deployment stage
 * (`LAMBDA_STAGE`, injected via serverless.yml `provider.environment`) so that
 * multiple environments (dev, test, prod) can coexist in the same AWS account.
 */
export const STAGE = process.env.LAMBDA_STAGE || 'dev';

export const DYNAMO_TABLE_APPLICATION_STATUS = `application-status-${STAGE}`;
export const DYNAMO_TABLE_TODO = `todo-${STAGE}`;
export const DYNAMO_TABLE_ORDER = `order-${STAGE}`;

// Queue URL and bucket name are resolved from the CloudFormation stack at
// deploy time and injected via serverless.yml `provider.environment`.
export const SQS_ORDER_QUEUE_URL = process.env.ORDER_QUEUE_URL || '';

export const S3_UPLOAD_BUCKET = process.env.UPLOAD_BUCKET || '';

/** Application roles, matched against the `custom:role` Cognito attribute. */
export const ROLES = Object.freeze({
  ADMIN: 'admin',
  USER: 'user',
});
