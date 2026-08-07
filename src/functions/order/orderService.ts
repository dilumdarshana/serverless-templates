import { dbClientPut } from '../../utils/dynamoDbHelper';
import { sendMessage } from '../../utils/sqsHelper';
import { DYNAMO_TABLE_ORDER, SQS_ORDER_QUEUE_URL } from '../../utils/constants';
import { generateId, getCurrentTimestamp } from '../../utils/commonHelper';
import { Attributes } from '../../controller';

export type OrderStatus = 'CREATED' | 'PROCESSED' | 'FAILED';

export interface OrderItem {
  orderId: string;
  customerEmail: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
}

export interface OrderMessage {
  orderId: string;
  customerEmail: string;
  amount: number;
}

/**
 * Create an order:
 *   1. persist the order record in DynamoDB (status CREATED)
 *   2. publish an event to the order SQS queue so it can be processed
 *      asynchronously by the `orderProcessor` function.
 *
 * This demonstrates the event-driven (producer) pattern: the API responds
 * immediately while the heavy work happens downstream.
 */
export const createOrder = async (data: Attributes) => {
  const { customerEmail, amount } = data as { customerEmail: string; amount: number };

  const order: OrderItem = {
    orderId: generateId(),
    customerEmail,
    amount,
    status: 'CREATED',
    createdAt: getCurrentTimestamp(),
  };

  await dbClientPut({
    TableName: DYNAMO_TABLE_ORDER,
    Item: order,
  });

  const message: OrderMessage = {
    orderId: order.orderId,
    customerEmail,
    amount,
  };

  await sendMessage(SQS_ORDER_QUEUE_URL, message);

  return {
    data: order,
    message: 'OrderCreatedSuccessfully',
  };
};
