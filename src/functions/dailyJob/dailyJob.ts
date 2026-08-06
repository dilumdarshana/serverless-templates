/**
 * Scheduled function (cron pattern).
 *
 * Runs daily via a CloudWatch Events schedule. Finds orders still stuck in the
 * CREATED state and re-publishes them to the queue for processing, effectively
 * acting as a retry / reconciliation job for events that may have failed.
 */
import { Context } from 'aws-lambda';
import { dbClientScan } from '../../utils/dynamoDbHelper';
import { sendMessage } from '../../utils/sqsHelper';
import { DYNAMO_TABLE_ORDER, SQS_ORDER_QUEUE_URL } from '../../utils/constants';
import { OrderItem, OrderMessage } from '../order/orderService';

const STALE_AFTER_HOURS = 24;

export const run = async (_event: unknown, _context: Context) => {
  const since = new Date(Date.now() - STALE_AFTER_HOURS * 60 * 60 * 1000).toISOString();

  const result = await dbClientScan({
    TableName: DYNAMO_TABLE_ORDER,
    FilterExpression: '#status = :status AND #createdAt < :since',
    ExpressionAttributeNames: {
      '#status': 'status',
      '#createdAt': 'createdAt',
    },
    ExpressionAttributeValues: {
      ':status': 'CREATED',
      ':since': since,
    },
  });

  const staleOrders = (result.Items as OrderItem[]) || [];

  let republished = 0;
  for (const order of staleOrders) {
    const message: OrderMessage = {
      orderId: order.orderId,
      customerEmail: order.customerEmail,
      amount: order.amount,
    };
    await sendMessage(SQS_ORDER_QUEUE_URL, message);
    republished += 1;
  }

  console.log(`Found ${staleOrders.length} stale order(s), republished ${republished}.`);

  return {
    message: `Found ${staleOrders.length} stale order(s), republished ${republished}`,
  };
};