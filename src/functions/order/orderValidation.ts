import { clean, validate } from '../../utils/validationHelper';
import { createOrder as createOrderSchema } from './orderSchema';
import { Request } from 'lambda-api';

export const validateCreateOrder = async ({ body }: Request) => {
  const attributes = clean(body);
  return validate(attributes, createOrderSchema);
};
