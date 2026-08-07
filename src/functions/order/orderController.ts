import controller from '../../controller';
import { createOrder as createOrderService } from './orderService';
import { validateCreateOrder } from './orderValidation';
import { Request, Response } from 'lambda-api';

/**
 * Thin HTTP adapter for the order producer endpoint. Delegates to the base
 * controller, which validates the body, assembles the attribute bag, runs the
 * service and maps errors to HTTP responses.
 */
export const createOrder = (req: Request, res: Response) => controller(req, res, {
  validator: validateCreateOrder,
  service: createOrderService,
});
