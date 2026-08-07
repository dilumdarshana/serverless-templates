import { dbClientGetItem } from '../../utils/dynamoDbHelper';
import { DYNAMO_TABLE_APPLICATION_STATUS } from '../../utils/constants';

/**
 * Health check service - reads a known record from the status table to prove
 * the Lambda can reach DynamoDB.
 *
 * The check never throws: a DynamoDB outage is reported in the payload
 * (`servicesStatus.dynamodb = "failed"`) instead of returning a 5xx, so a
 * monitoring system can distinguish "Lambda is down" from "DynamoDB is down".
 */
export const status = async () => {
  let dynamodb: 'connected' | 'failed' = 'connected';

  try {
    await dbClientGetItem({
      TableName: DYNAMO_TABLE_APPLICATION_STATUS,
      Key: { id: 1 },
    });
  } catch (error) {
    console.error('Health check: DynamoDB unreachable', error);
    dynamodb = 'failed';
  }

  const isHealthy = dynamodb === 'connected';

  return {
    message: isHealthy ? 'success' : 'degraded',
    data: {
      serverTime: new Date().toISOString(),
      servicesStatus: { dynamodb },
    },
  };
};
