import { dbClientUpdate } from '../../utils/dynamoDbHelper';
import { DYNAMO_TABLE_ORDER } from '../../utils/constants';
import { OrderMessage, OrderStatus } from '../order/orderService';

/**
 * Process a single order message.
 *
 * Stands in for the "heavy" downstream work of the event-driven flow. In a real
 * service this would call a payment provider, send emails, trigger fulfilment,
 * etc. If it throws, the caller (`orderProcessor.run`) reports the record as a
 * batch item failure so SQS redelivers it; messages that keep failing move to
 * the DLQ after `maxReceiveCount` attempts.
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
