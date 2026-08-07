import { API } from 'lambda-api';
import { createPresignedUpload, getPresignedDownload } from './uploadController';

// Routes registered on the `upload` function's own router. The shared factory
// (createHttpHandler) adds CORS + preflight before these are mounted, so only
// feature-specific routes belong here.
export const registerUploadRoutes = (api: API) => {
  api.post('/upload/presigned', createPresignedUpload);
  // `*` is a lambda-api wildcard segment; it captures the rest of the path into
  // req.params.wildcard (the S3 object key, which may contain slashes).
  api.get('/upload/*', getPresignedDownload);
};
