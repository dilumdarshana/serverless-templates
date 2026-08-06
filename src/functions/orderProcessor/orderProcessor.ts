/**
 * SQS consumer (event-driven pattern).
 *
 * Triggered whenever a message lands on the order queue. SQS delivers messages
 * in batches; each record is processed independently. If processing a record
 * throws, the batch fails and SQS redelivers the message. After exceeding the
 * configured `MaximumReceives`, the message moves to the dead letter queue.
 */
import { SQSEvent, Context } from 'aws-lambda';
import { processOrder } from './orderProcessorService';
import { OrderMessage } from '../order/orderService';

export const run = async (event: SQSEvent, _context: Context) => {
  const results: OrderMessage[] = [];

  for (const record of event.Records) {
    const message: OrderMessage = JSON.parse(record.body);
    await processOrder(message);
    results.push(message);
  }

  console.log(`Processed ${results.length} order message(s) from queue.`);

  return {
    message: `Processed ${results.length} order message(s)`,
    data: results,
  };
};