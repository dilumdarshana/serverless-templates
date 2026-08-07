import { API } from 'lambda-api';
import { healthChecker } from './commonController';

// Routes registered on the `common` function's own router. The shared factory
// (createHttpHandler) adds CORS + preflight before these are mounted, so only
// feature-specific routes belong here.
export const registerCommonRoutes = (api: API) => {
  api.post('/common/status', healthChecker);
};
