import { API } from 'lambda-api';
import {
  createTodo,
  getTodo,
  listTodos,
  listTodosByStatus,
  updateTodo,
  deleteTodo,
} from './todoController';

// Routes registered on the `todo` function's own router. The shared factory
// (createHttpHandler) adds CORS + preflight before these are mounted, so only
// feature-specific routes belong here.
export const registerTodoRoutes = (api: API) => {
  api.post('/todo', createTodo);
  api.get('/todo', listTodos);
  api.get('/todo/by-status', listTodosByStatus);
  api.get('/todo/:id', getTodo);
  api.patch('/todo/:id', updateTodo);
  api.delete('/todo/:id', deleteTodo);
};
