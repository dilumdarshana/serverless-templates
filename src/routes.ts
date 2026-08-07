/**
 * HTTP route definitions. `handler.run` registers these on a single lambda-api
 * instance shared by every HTTP function.
 *
 * Note: routes are grouped under `/v1`. API Gateway forwards requests to the
 * corresponding function via `{proxy+}` paths, so each feature can scale
 * independently while reusing the same router.
 */
import { healthChecker } from './functions/common/commonController';
import {
  createTodo,
  getTodo,
  listTodos,
  listTodosByStatus,
  updateTodo,
  deleteTodo,
} from './functions/todo/todoController';
import { createOrder } from './functions/order/orderController';
import {
  createPresignedUpload,
  getPresignedDownload,
} from './functions/upload/uploadController';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const load = (api: any) => {
  // Preflight CORS
  api.options('/*', (req: any, res: any) => {
    res.cors().send({});
  });

  // ── Common ──────────────────────────────────────────────
  api.post('/common/status', healthChecker);

  // ── Todo (REST API + DynamoDB CRUD) ─────────────────────
  api.post('/todo', createTodo);
  api.get('/todo', listTodos);
  api.get('/todo/by-status', listTodosByStatus);
  api.get('/todo/:id', getTodo);
  api.patch('/todo/:id', updateTodo);
  api.delete('/todo/:id', deleteTodo);

  // ── Order (event-driven producer -> SQS) ────────────────
  api.post('/order', createOrder);

  // ── Upload (S3 presigned URLs) ──────────────────────────
  api.post('/upload/presigned', createPresignedUpload);
  api.get('/upload/*', getPresignedDownload);
};
