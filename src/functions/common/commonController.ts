import controller from '../../controller';
import { status as statusService } from './commonService';
import { Request, Response } from 'lambda-api';

/**
 * Health check endpoint - verifies the service is up and DynamoDB is reachable.
 * No validator: the endpoint takes no input.
 */
export const healthChecker = (req: Request, res: Response) => controller(req, res, {
  validator: null,
  service: statusService,
});
