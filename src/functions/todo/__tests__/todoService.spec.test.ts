import { createTodo, getTodo, deleteTodo } from '../todoService';
import { dbClientPut, dbClientGetItem, dbClientDelete } from '../../../utils/dynamoDbHelper';

jest.mock('../../../utils/dynamoDbHelper', () => ({
  dbClientPut: jest.fn(),
  dbClientGetItem: jest.fn(),
  dbClientScan: jest.fn(),
  dbClientQuery: jest.fn(),
  dbClientUpdate: jest.fn(),
  dbClientDelete: jest.fn(),
  buildUpdateExpression: jest.fn(),
}));

const mockedPut = dbClientPut as jest.Mock;
const mockedGet = dbClientGetItem as jest.Mock;
const mockedDelete = dbClientDelete as jest.Mock;

describe('Todo service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createTodo should persist a new todo item', async () => {
    mockedPut.mockResolvedValue({});

    const res = await createTodo({ task: 'Pay mobile bill' });

    expect(mockedPut).toHaveBeenCalledTimes(1);
    expect(mockedPut.mock.calls[0][0].Item.task).toBe('Pay mobile bill');
    expect(mockedPut.mock.calls[0][0].Item.status).toBe('pending');
    expect(res.message).toBe('TodoCreatedSuccessfully');
    expect(res.data.id).toBeDefined();
  });

  test('getTodo should return the item when it exists', async () => {
    mockedGet.mockResolvedValue({
      Item: { id: 'abc', task: 'Buy milk', status: 'pending', createdAt: '2026-01-01T00:00:00.000Z' },
    });

    const res = await getTodo({ params: { id: 'abc' } });

    expect(res.data.task).toBe('Buy milk');
  });

  test('getTodo should throw 404 when the item does not exist', async () => {
    mockedGet.mockResolvedValue({});

    await expect(getTodo({ params: { id: 'missing' } })).rejects.toMatchObject({ code: 404 });
  });

  test('deleteTodo should throw 404 when the item does not exist', async () => {
    mockedDelete.mockResolvedValue({});

    await expect(deleteTodo({ params: { id: 'missing' } })).rejects.toMatchObject({ code: 404 });
  });
});
