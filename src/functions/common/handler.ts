import { createHttpHandler } from '../../handlers/createHttpHandler';
import { registerCommonRoutes } from './routes';

// `common` function entry point - a lambda-api router wired up by the shared
// factory, registering only the common feature's routes. serverless.yml points
// `handler` at this export so esbuild bundles only this feature's code.
export const run = createHttpHandler(registerCommonRoutes);
