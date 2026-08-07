/**
 * DynamoDB client helpers.
 *
 * Uses the high-level `DynamoDBDocumentClient` from `@aws-sdk/lib-dynamodb`.
 * Unlike the low-level `DynamoDBClient`, the DocumentClient automatically
 * marshals/unmarshals JavaScript values (strings, numbers, booleans, objects)
 * to and from DynamoDB attribute values, so you never deal with `{ S: "..." }`.
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

/**
 * Plain JavaScript value types the DocumentClient can marshal for us.
 * This is a subset of `NativeAttributeValue` and is what the code in this
 * project writes to DynamoDB (never `{ S: "..." }` shapes).
 */
type DynamoDbValue = string | number | boolean | null | undefined;

/**
 * Client configuration. When running unit tests (`LOCAL === 'true'`) the
 * region is taken from `LAMBDA_REGION`; in AWS the SDK falls back to the
 * `AWS_REGION` / credentials already present in the Lambda runtime.
 */
const getDynamoDbConfig = () => (process.env.LOCAL === 'true'
  ? { region: process.env.LAMBDA_REGION }
  : {});

const dDbClient = new DynamoDBClient({ ...getDynamoDbConfig() });
const docClient = DynamoDBDocumentClient.from(dDbClient);

// Thin wrappers over the DocumentClient commands - they only exist so feature
// services can import a short, typed name instead of constructing commands
// inline. Each one passes the DocumentClient input straight through.
export const dbClientGetItem = (params: GetCommand['input']) => docClient.send(new GetCommand(params));

export const dbClientQuery = (params: QueryCommand['input']) => docClient.send(new QueryCommand(params));

export const dbClientPut = (params: PutCommand['input']) => docClient.send(new PutCommand(params));

export const dbClientUpdate = (params: UpdateCommand['input']) => docClient.send(new UpdateCommand(params));

export const dbClientDelete = (params: DeleteCommand['input']) => docClient.send(new DeleteCommand(params));

export const dbClientScan = (params: ScanCommand['input']) => docClient.send(new ScanCommand(params));

/**
 * Build a dynamic UpdateExpression from a partial attributes object.
 * Only the provided attributes are included in the SET clause, which lets a
 * single endpoint partially update an item.
 *
 * Example: { task: 'Buy milk', status: 'completed' } produces
 *   UPDATE todo SET #task = :task, #status = :status WHERE ...
 *
 * Placeholder names (`#task`) are safe against reserved-word collisions; a
 * literal `task` in the expression would fail if it were ever a reserved word.
 */
export const buildUpdateExpression = (
  attributes: Record<string, DynamoDbValue>,
): { UpdateExpression: string; ExpressionAttributeNames: Record<string, string>; ExpressionAttributeValues: Record<string, DynamoDbValue> } => {
  const ExpressionAttributeNames: Record<string, string> = {};
  const ExpressionAttributeValues: Record<string, DynamoDbValue> = {};

  const setExpressions = Object.entries(attributes).map(([key, value]) => {
    const name = `#${key}`;
    const val = `:${key}`;
    ExpressionAttributeNames[name] = key;
    ExpressionAttributeValues[val] = value;
    return `${name} = ${val}`;
  });

  return {
    UpdateExpression: `SET ${setExpressions.join(', ')}`,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
  };
};

export { dDbClient, getDynamoDbConfig };
