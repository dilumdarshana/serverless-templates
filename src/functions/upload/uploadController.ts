import controller from '../../controller';
import {
  createPresignedUpload as createPresignedUploadService,
  getPresignedDownload as getPresignedDownloadService,
} from './uploadService';
import { validateCreatePresignedUpload } from './uploadValidation';
import { Request, Response } from 'lambda-api';

/**
 * Thin HTTP adapters for the S3 presigned URL endpoints. Each delegates to the
 * base controller, which validates the body (when present), assembles the
 * attribute bag, runs the service and maps errors to HTTP responses.
 */

export const createPresignedUpload = (req: Request, res: Response) => controller(req, res, {
  validator: validateCreatePresignedUpload,
  service: createPresignedUploadService,
});

export const getPresignedDownload = (req: Request, res: Response) => controller(req, res, {
  validator: null,
  service: getPresignedDownloadService,
});
