import { API } from 'lambda-api';
import { createOrder } from './orderController';

// Routes registered on the `order` function's own router. The shared factory
// (createHttpHandler) adds CORS + preflight before these are mounted, so only
// feature-specific routes belong here.
export const registerOrderRoutes = (api: API) => {
  api.post('/order', createOrder);
};
