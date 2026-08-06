import controller from '../../controller';
import { createOrder as createOrderService } from './orderService';
import { validateCreateOrder } from './orderValidation';
import { Request, Response } from 'lambda-api';

export const createOrder = (req: Request, res: Response) => controller(req, res, {
  validator: validateCreateOrder,
  service: createOrderService,
});