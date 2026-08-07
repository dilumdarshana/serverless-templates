/**
 * Scheduled function (cron pattern).
 *
 * Runs daily via a CloudWatch Events schedule. Finds orders still stuck in the
 * CREATED state and re-publishes them to the queue for processing, effectively
 * acting as a retry / reconciliation job for events that may have failed.
 *
 * Uses a Query against the `StatusCreatedAtIndex` GSI (status + createdAt)
 * rather than a full-table Scan.
 */
import { ScheduledEvent, Context } from 'aws-lambda';
import { dbClientQuery } from '../../utils/dynamoDbHelper';
import { sendMessageBatch } from '../../utils/sqsHelper';
import { DYNAMO_TABLE_ORDER, SQS_ORDER_QUEUE_URL } from '../../utils/constants';
import { OrderItem, OrderMessage } from '../order/orderService';

const STALE_AFTER_HOURS = 24;
const MAX_BATCH = 10;

export const run = async (_event: ScheduledEvent, _context: Context) => {
  const since = new Date(Date.now() - STALE_AFTER_HOURS * 60 * 60 * 1000).toISOString();

  const result = await dbClientQuery({
    TableName: DYNAMO_TABLE_ORDER,
    IndexName: 'StatusCreatedAtIndex',
    KeyConditionExpression: '#status = :status AND #createdAt < :since',
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

  const messages: OrderMessage[] = staleOrders.map((order) => ({
    orderId: order.orderId,
    customerEmail: order.customerEmail,
    amount: order.amount,
  }));

  let republished = 0;
  for (let i = 0; i < messages.length; i += MAX_BATCH) {
    const batch = messages.slice(i, i + MAX_BATCH);
    await sendMessageBatch(SQS_ORDER_QUEUE_URL, batch);
    republished += batch.length;
  }

  console.log(`Found ${staleOrders.length} stale order(s), republished ${republished}.`);

  return {
    message: `Found ${staleOrders.length} stale order(s), republished ${republished}`,
  };
};
