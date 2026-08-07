import { clean, validate } from '../../utils/validationHelper';
import { createOrder as createOrderSchema } from './orderSchema';
import { Request } from 'lambda-api';
import { Attributes } from '../../controller';

/**
 * Validate the order create request body and return clean attributes.
 * @throws HTTP 400 when the body does not match the schema.
 */
export const validateCreateOrder = async ({ body }: Request): Promise<Attributes> => {
  const attributes = clean(body);
  return validate<Attributes>(attributes, createOrderSchema);
};
