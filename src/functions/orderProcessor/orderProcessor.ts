/**
 * SQS consumer (event-driven pattern).
 *
 * Triggered whenever a message lands on the order queue. SQS delivers messages
 * in batches; each record is processed independently and failures are reported
 * via the partial batch response (`batchItemFailures`) - only the failed
 * records are redelivered, not the whole batch. After exceeding the configured
 * `MaximumReceives`, a message moves to the dead letter queue.
 */
import { SQSEvent, Context, SQSBatchItemFailure, SQSBatchResponse } from 'aws-lambda';
import { processOrder } from './orderProcessorService';
import { OrderMessage } from '../order/orderService';

export const run = async (event: SQSEvent, _context: Context): Promise<SQSBatchResponse> => {
  const batchItemFailures: SQSBatchItemFailure[] = [];
  let processed = 0;

  for (const record of event.Records) {
    try {
      const message: OrderMessage = JSON.parse(record.body);
      await processOrder(message);
      processed += 1;
    } catch (error) {
      console.error('Failed to process order message', { messageId: record.messageId, error });
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  console.log(`Processed ${processed} order message(s), ${batchItemFailures.length} failed.`);

  return { batchItemFailures };
};
