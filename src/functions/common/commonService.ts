import { dbClientGetItem } from '../../utils/dynamoDbHelper';
import { DYNAMO_TABLE_APPLICATION_STATUS } from '../../utils/constants';

/**
 * Health check service - reads a known record from the status table to prove
 * the Lambda can reach DynamoDB.
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

  return {
    message: 'success',
    data: {
      serverTime: new Date().toISOString(),
      servicesStatus: { dynamodb },
    },
  };
};
