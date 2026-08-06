import { createOrder } from '../orderService';
import { dbClientPut } from '../../../utils/dynamoDbHelper';
import { sendMessage } from '../../../utils/sqsHelper';

jest.mock('../../../utils/dynamoDbHelper', () => ({
  dbClientPut: jest.fn(),
}));

jest.mock('../../../utils/sqsHelper', () => ({
  sendMessage: jest.fn(),
}));

const mockedPut = dbClientPut as jest.Mock;
const mockedSend = sendMessage as jest.Mock;

describe('Order service (producer)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createOrder should persist the order and publish to SQS', async () => {
    mockedPut.mockResolvedValue({});
    mockedSend.mockResolvedValue({});

    const res = await createOrder({ customerEmail: 'user@example.com', amount: 99.5 });

    // persisted to DynamoDB with CREATED status
    expect(mockedPut).toHaveBeenCalledTimes(1);
    expect(mockedPut.mock.calls[0][0].Item.status).toBe('CREATED');

    // published to the queue
    expect(mockedSend).toHaveBeenCalledTimes(1);
    const [queueUrl, message] = mockedSend.mock.calls[0];
    expect(queueUrl).toBeDefined();
    expect(message.orderId).toBeDefined();
    expect(message.customerEmail).toBe('user@example.com');

    expect(res.message).toBe('OrderCreatedSuccessfully');
  });
});