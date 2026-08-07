import {
  dbClientPut,
  dbClientGetItem,
  dbClientScan,
  dbClientQuery,
  dbClientUpdate,
  dbClientDelete,
  buildUpdateExpression,
} from '../../utils/dynamoDbHelper';
import { DYNAMO_TABLE_TODO } from '../../utils/constants';
import { generateId, getCurrentTimestamp } from '../../utils/commonHelper';
import { InterceptError } from '../../utils/errorHelper';
import { Attributes } from '../../controller';

export interface TodoItem {
  id: string;
  task: string;
  status: 'pending' | 'completed';
  createdAt: string;
  updatedAt?: string;
}

const TABLE = DYNAMO_TABLE_TODO;

/**
 * Create a todo item.
 * Demonstrates: PutItem
 */
export const createTodo = async (data: Attributes) => {
  const { task } = data as { task: string };
  const timestamp = getCurrentTimestamp();

  const item: TodoItem = {
    id: generateId(),
    task,
    status: 'pending',
    createdAt: timestamp,
  };

  await dbClientPut({
    TableName: TABLE,
    Item: item,
  });

  return {
    data: item,
    message: 'TodoCreatedSuccessfully',
  };
};

/**
 * Fetch a single todo by id.
 * Demonstrates: GetItem
 */
export const getTodo = async (data: Attributes) => {
  const { id } = data.params as { id: string };

  const result = await dbClientGetItem({
    TableName: TABLE,
    Key: { id },
  });

  if (!result.Item) {
    throw InterceptError('Todo not found', 404);
  }

  return {
    data: result.Item as TodoItem,
    message: 'success',
  };
};

/**
 * List all todos.
 * Demonstrates: Scan (note: scans read the whole table - fine for small data,
 * but a Query against an index is preferred for large tables).
 */
export const listTodos = async () => {
  const result = await dbClientScan({
    TableName: TABLE,
  });

  return {
    data: result.Items as TodoItem[],
    message: 'success',
  };
};

/**
 * List todos filtered by status.
 * Demonstrates: Query against a Global Secondary Index (StatusIndex on
 * `status` + `createdAt`), which is far cheaper than a Scan.
 */
export const listTodosByStatus = async (data: Attributes) => {
  const { status } = data.query as { status: string };

  const result = await dbClientQuery({
    TableName: TABLE,
    IndexName: 'StatusIndex',
    KeyConditionExpression: '#status = :status',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':status': status },
    ScanIndexForward: false,
  });

  return {
    data: result.Items as TodoItem[],
    message: 'success',
  };
};

/**
 * Partially update a todo (only provided fields are updated).
 * Demonstrates: UpdateItem with a dynamic UpdateExpression.
 */
export const updateTodo = async (data: Attributes) => {
  const { id } = data.params as { id: string };
  const { task, status } = data as { task?: string; status?: 'pending' | 'completed' };

  // Only include fields that were actually provided in the request body
  const updates: { task?: string; status?: 'pending' | 'completed' } = {};
  if (task !== undefined) updates.task = task;
  if (status !== undefined) updates.status = status;

  // ensure the item exists first
  await getTodo(data);

  const { UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues } = buildUpdateExpression({
    ...updates,
    updatedAt: getCurrentTimestamp(),
  });

  await dbClientUpdate({
    TableName: TABLE,
    Key: { id },
    UpdateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  });

  return {
    data: { id, ...updates },
    message: 'TodoUpdatedSuccessfully',
  };
};

/**
 * Delete a todo.
 * Demonstrates: DeleteItem with a conditional expression.
 */
export const deleteTodo = async (data: Attributes) => {
  const { id } = data.params as { id: string };

  const result = await dbClientDelete({
    TableName: TABLE,
    Key: { id },
    ReturnValues: 'ALL_OLD',
  });

  if (!result.Attributes) {
    throw InterceptError('Todo not found', 404);
  }

  return {
    data: { id },
    message: 'TodoDeletedSuccessfully',
  };
};
