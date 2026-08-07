import { clean, validate } from '../../utils/validationHelper';
import { createTodo as createTodoSchema, updateTodo as updateTodoSchema } from './todoSchema';
import { Request } from 'lambda-api';

export const validateCreateTodo = async ({ body }: Request) => {
  const attributes = clean(body);
  return validate(attributes, createTodoSchema);
};

export const validateUpdateTodo = async ({ body }: Request) => {
  const attributes = clean(body);
  return validate(attributes, updateTodoSchema);
};
