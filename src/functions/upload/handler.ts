import { createHttpHandler } from '../../handlers/createHttpHandler';
import { registerUploadRoutes } from './routes';

export const run = createHttpHandler(registerUploadRoutes);
