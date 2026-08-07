/**
 * SQS client helper for publishing messages.
 */
import { SQSClient, SendMessageCommand, SendMessageBatchCommand } from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({ region: process.env.LAMBDA_REGION });

/**
 * Send a single message to a queue.
 * @param queueUrl - full queue URL
 * @param body - message payload (will be JSON stringified)
 * @param delaySeconds - optional visibility delay in seconds
 */
export const sendMessage = async (queueUrl: string, body: unknown, delaySeconds = 0) => {
  const params = {
    QueueUrl: queueUrl,
    MessageBody: typeof body === 'string' ? body : JSON.stringify(body),
    DelaySeconds: delaySeconds,
  };

  return sqsClient.send(new SendMessageCommand(params));
};

/**
 * Send multiple messages to a queue in a single API call (max 10 per batch).
 */
export const sendMessageBatch = async (queueUrl: string, messages: unknown[]) => {
  const params = {
    QueueUrl: queueUrl,
    Entries: messages.map((body, index) => ({
      Id: `${index}`,
      MessageBody: typeof body === 'string' ? body : JSON.stringify(body),
    })),
  };

  return sqsClient.send(new SendMessageBatchCommand(params));
};

export { sqsClient };
