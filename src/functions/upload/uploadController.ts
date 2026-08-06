import controller from '../../controller';
import {
  createPresignedUpload as createPresignedUploadService,
  getPresignedDownload as getPresignedDownloadService,
} from './uploadService';
import { validateCreatePresignedUpload } from './uploadValidation';
import { Request, Response } from 'lambda-api';

export const createPresignedUpload = (req: Request, res: Response) => controller(req, res, {
  validator: validateCreatePresignedUpload,
  service: createPresignedUploadService,
});

export const getPresignedDownload = (req: Request, res: Response) => controller(req, res, {
  validator: null,
  service: getPresignedDownloadService,
});