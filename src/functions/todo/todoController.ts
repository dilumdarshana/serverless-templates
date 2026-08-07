import controller from '../../controller';
import {
  createTodo as createTodoService,
  getTodo as getTodoService,
  listTodos as listTodosService,
  listTodosByStatus as listTodosByStatusService,
  updateTodo as updateTodoService,
  deleteTodo as deleteTodoService,
} from './todoService';
import { validateCreateTodo, validateUpdateTodo } from './todoValidation';
import { Request, Response } from 'lambda-api';

/**
 * Thin HTTP adapters: each one delegates to the base controller, wiring a
 * validator (when the endpoint takes a body) and the feature's service.
 * All request/response plumbing (attribute bag assembly, error mapping) is
 * handled centrally by `src/controller.ts`.
 */

export const createTodo = (req: Request, res: Response) => controller(req, res, {
  validator: validateCreateTodo,
  service: createTodoService,
});

export const getTodo = (req: Request, res: Response) => controller(req, res, {
  validator: null,
  service: getTodoService,
});

export const listTodos = (req: Request, res: Response) => controller(req, res, {
  validator: null,
  service: listTodosService,
});

export const listTodosByStatus = (req: Request, res: Response) => controller(req, res, {
  validator: null,
  service: listTodosByStatusService,
});

export const updateTodo = (req: Request, res: Response) => controller(req, res, {
  validator: validateUpdateTodo,
  service: updateTodoService,
});

export const deleteTodo = (req: Request, res: Response) => controller(req, res, {
  validator: null,
  service: deleteTodoService,
});
