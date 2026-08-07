import { dbClientUpdate } from '../../utils/dynamoDbHelper';
import { DYNAMO_TABLE_ORDER } from '../../utils/constants';
import { OrderMessage, OrderStatus } from '../order/orderService';

/**
 * Process a single order message - in a real service this would call a
 * payment provider, send emails, trigger fulfilment, etc.
 */
export const processOrder = async (message: OrderMessage) => {
  // Simulated business logic delay
  await new Promise((resolve) => setTimeout(resolve, 50));

  await dbClientUpdate({
    TableName: DYNAMO_TABLE_ORDER,
    Key: { orderId: message.orderId },
    UpdateExpression: 'SET #status = :status, #processedAt = :processedAt',
    ExpressionAttributeNames: {
      '#status': 'status',
      '#processedAt': 'processedAt',
    },
    ExpressionAttributeValues: {
      ':status': 'PROCESSED' as OrderStatus,
      ':processedAt': new Date().toISOString(),
    },
  });

  return true;
};
