/**
 * Global application constants.
 * Table / queue / bucket names are suffixed with the deployment stage so that
 * multiple environments (dev, test, prod) can coexist in the same AWS account.
 */
export const STAGE = process.env.LAMBDA_STAGE || 'dev';

export const DYNAMO_TABLE_APPLICATION_STATUS = `application-status-${STAGE}`;
export const DYNAMO_TABLE_TODO = `todo-${STAGE}`;
export const DYNAMO_TABLE_ORDER = `order-${STAGE}`;

export const SQS_ORDER_QUEUE_URL = process.env.ORDER_QUEUE_URL || '';

export const S3_UPLOAD_BUCKET = process.env.UPLOAD_BUCKET || '';

export const ROLES = Object.freeze({
  ADMIN: 'admin',
  USER: 'user',
});