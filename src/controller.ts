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
import { AuthorizerContext } from './utils/cognitoHelper';

/**
 * Attribute bag assembled by the base controller and forwarded to services.
 * Services narrow this down to the fields they actually need (they were
 * validated by the Joi validator before reaching the service).
 */
export interface Attributes {
  [key: string]: unknown;
  cookies?: Record<string, string>;
  headers?: Record<string, string | undefined>;
  query?: Record<string, string | undefined>;
  params?: Record<string, string | undefined>;
}

export interface ServiceFunction {
  (data: Attributes, extraData?: AuthorizerContext): Promise<unknown>;
}

interface ControllerParams {
  service: ServiceFunction;
  validator?: ((req: Request) => Promise<Attributes>) | null;
  resolve?: (res: Response, data: unknown) => Promise<void>;
  reject?: (err: unknown, res: Response, req: Request) => Promise<void>;
}

const controller = async (req: Request, res: Response, params: ControllerParams) => {
  const resolve = params.resolve || defaultResolve;
  const reject = params.reject || defaultReject;

  try {
    const attributes: Attributes = params.validator ? await params.validator(req) : {};

    if (req.cookies) attributes.cookies = req.cookies;
    if (req.headers) attributes.headers = req.headers;
    if (req.query) attributes.query = req.query;
    if (req.params) attributes.params = req.params;

    // Extra data (role, email, ...) injected by the API Gateway custom authorizer
    const extraData: AuthorizerContext =
      (req.requestContext.authorizer as { lambda?: AuthorizerContext } | null)?.lambda ?? {};

    const data = await params.service(attributes, extraData);

    return resolve(res, data);
  } catch (err) {
    return reject(err, res, req);
  }
};

export default controller;
