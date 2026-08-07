import { API } from 'lambda-api';
import {
  createTodo,
  getTodo,
  listTodos,
  listTodosByStatus,
  updateTodo,
  deleteTodo,
} from './todoController';

export const registerTodoRoutes = (api: API) => {
  api.post('/todo', createTodo);
  api.get('/todo', listTodos);
  api.get('/todo/by-status', listTodosByStatus);
  api.get('/todo/:id', getTodo);
  api.patch('/todo/:id', updateTodo);
  api.delete('/todo/:id', deleteTodo);
};
