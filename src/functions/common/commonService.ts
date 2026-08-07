import { dbClientGetItem } from '../../utils/dynamoDbHelper';
import { DYNAMO_TABLE_APPLICATION_STATUS } from '../../utils/constants';

/**
 * Health check service - reads a known record from the status table to prove
 * the Lambda can reach DynamoDB.
 */
export const status = async () => {
  const params = {
    TableName: DYNAMO_TABLE_APPLICATION_STATUS,
    Key: { id: 1 },
  };

  let dynamoDbRes: unknown = null;

  try {
    dynamoDbRes = await dbClientGetItem(params);
  } catch (e) {
    dynamoDbRes = 'error';
  }

  return {
    message: 'success',
    data: {
      serverTime: new Date().toISOString(),
      servicesStatus: {
        dynamodb: dynamoDbRes === 'error' ? 'failed' : 'connected',
      },
    },
  };
};
