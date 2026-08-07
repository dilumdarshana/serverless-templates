import { createHttpHandler } from '../../handlers/createHttpHandler';
import { registerTodoRoutes } from './routes';

export const run = createHttpHandler(registerTodoRoutes);
