import { createHttpHandler } from '../../handlers/createHttpHandler';
import { registerOrderRoutes } from './routes';

export const run = createHttpHandler(registerOrderRoutes);
