import { createHttpHandler } from '../../handlers/createHttpHandler';
import { registerTodoRoutes } from './routes';

// `todo` function entry point - a lambda-api router wired up by the shared
// factory, registering only the todo feature's routes. serverless.yml points
// `handler` at this export so esbuild bundles only this feature's code.
export const run = createHttpHandler(registerTodoRoutes);
