import { API } from 'lambda-api';
import { createPresignedUpload, getPresignedDownload } from './uploadController';

export const registerUploadRoutes = (api: API) => {
  api.post('/upload/presigned', createPresignedUpload);
  api.get('/upload/*', getPresignedDownload);
};
