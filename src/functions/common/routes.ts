import { API } from 'lambda-api';
import { healthChecker } from './commonController';

export const registerCommonRoutes = (api: API) => {
  api.post('/common/status', healthChecker);
};
