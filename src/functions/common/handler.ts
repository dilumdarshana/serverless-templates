import { createHttpHandler } from '../../handlers/createHttpHandler';
import { registerCommonRoutes } from './routes';

export const run = createHttpHandler(registerCommonRoutes);
