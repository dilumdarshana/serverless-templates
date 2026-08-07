import { API } from 'lambda-api';
import { createOrder } from './orderController';

export const registerOrderRoutes = (api: API) => {
  api.post('/order', createOrder);
};
