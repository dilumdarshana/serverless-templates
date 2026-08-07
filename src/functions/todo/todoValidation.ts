import { clean, validate } from '../../utils/validationHelper';
import { createTodo as createTodoSchema, updateTodo as updateTodoSchema } from './todoSchema';
import { Request } from 'lambda-api';
import { Attributes } from '../../controller';

/**
 * Validate the todo create request body and return clean attributes.
 * @throws HTTP 400 when the body does not match the schema.
 */
export const validateCreateTodo = async ({ body }: Request): Promise<Attributes> => {
  const attributes = clean(body);
  return validate<Attributes>(attributes, createTodoSchema);
};

/**
 * Validate the todo update request body and return clean attributes.
 * At least one updatable field must be present (schema `.min(1)`).
 */
export const validateUpdateTodo = async ({ body }: Request): Promise<Attributes> => {
  const attributes = clean(body);
  return validate<Attributes>(attributes, updateTodoSchema);
};
