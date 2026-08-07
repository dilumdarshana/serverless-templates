/**
 * Base controller - standardises the request flow for every endpoint:
 *
 *   1. validate the request (Joi schema) -> attributes
 *   2. pass attributes + authorizer context to the service
 *   3. send the service result (or error) back as JSON
 *
 * Controllers stay thin; business logic lives in feature services.
 */
import { defaultReject, defaultResolve } from './utils/responseHelper';
import { Request, Response } from 'lambda-api';

export interface ServiceFunction {
  (data: any, extraData?: Record<string, any>): Promise<any>;
}

interface ControllerParams {
  service: ServiceFunction;
  validator?: ((req: Request) => Promise<Record<string, any>>) | null;
  resolve?: (res: Response, data: any) => Promise<void>;
  reject?: (err: any, res: Response, req: Request) => Promise<void>;
}

const controller = async (req: Request, res: Response, params: ControllerParams) => {
  const resolve = params.resolve || defaultResolve;
  const reject = params.reject || defaultReject;

  try {
    const attributes = params.validator ? await params.validator(req) : {} as Record<string, any>;

    if (req.cookies) attributes.cookies = req.cookies;
    if (req.headers) attributes.headers = req.headers;
    if (req.query) attributes.query = req.query;
    if (req.params) attributes.params = req.params;

    // Extra data (role, email, ...) injected by the API Gateway custom authorizer
    const { requestContext: { authorizer: { lambda: extraData } = {} } = {} } = req as any;

    const data = await params.service(attributes, extraData);

    return resolve(res, data);
  } catch (err) {
    return reject(err, res, req);
  }
};

export default controller;
