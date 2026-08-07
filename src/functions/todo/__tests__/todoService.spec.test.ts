import { createTodo, getTodo, deleteTodo, updateTodo } from '../todoService';
import {
  dbClientPut,
  dbClientGetItem,
  dbClientDelete,
  dbClientUpdate,
  buildUpdateExpression,
} from '../../../utils/dynamoDbHelper';

jest.mock('../../../utils/dynamoDbHelper', () => ({
  dbClientPut: jest.fn(),
  dbClientGetItem: jest.fn(),
  dbClientScan: jest.fn(),
  dbClientQuery: jest.fn(),
  dbClientUpdate: jest.fn(),
  dbClientDelete: jest.fn(),
  buildUpdateExpression: jest.fn(() => ({
    UpdateExpression: 'SET #updatedAt = :updatedAt',
    ExpressionAttributeNames: { '#updatedAt': 'updatedAt' },
    ExpressionAttributeValues: { ':updatedAt': '2026-01-01T00:00:00.000Z' },
  })),
}));

const mockedPut = dbClientPut as jest.Mock;
const mockedGet = dbClientGetItem as jest.Mock;
const mockedDelete = dbClientDelete as jest.Mock;
const mockedUpdate = dbClientUpdate as jest.Mock;
const mockedBuildUpdateExpression = buildUpdateExpression as jest.Mock;

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

  test('updateTodo should update only the fields provided in the request body', async () => {
    mockedGet.mockResolvedValue({
      Item: { id: 'abc', task: 'Buy milk', status: 'pending', createdAt: '2026-01-01T00:00:00.000Z' },
    });
    mockedUpdate.mockResolvedValue({
      Attributes: { id: 'abc', task: 'Updated task', status: 'pending', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z' },
    });
    mockedBuildUpdateExpression.mockReturnValue({
      UpdateExpression: 'SET #task = :task, #updatedAt = :updatedAt',
      ExpressionAttributeNames: { '#task': 'task', '#updatedAt': 'updatedAt' },
      ExpressionAttributeValues: { ':task': 'Updated task', ':updatedAt': '2026-01-02T00:00:00.000Z' },
    });

    const res = await updateTodo({ params: { id: 'abc' }, task: 'Updated task' });

    expect(mockedBuildUpdateExpression).toHaveBeenCalledWith(
      expect.objectContaining({ task: 'Updated task' }),
    );
    expect(mockedBuildUpdateExpression).toHaveBeenCalledWith(
      expect.not.objectContaining({ status: expect.anything() }),
    );
    expect(mockedUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ Key: { id: 'abc' }, ReturnValues: 'ALL_NEW' }),
    );
    // the response is the persisted item (includes server-set updatedAt)
    expect(res.data).toMatchObject({ id: 'abc', task: 'Updated task', updatedAt: '2026-01-02T00:00:00.000Z' });
    expect(res.message).toBe('TodoUpdatedSuccessfully');
  });
});
