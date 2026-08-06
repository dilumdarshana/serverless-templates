import { clean, validate } from '../../utils/validationHelper';
import { createPresignedUpload as createPresignedUploadSchema } from './uploadSchema';
import { Request } from 'lambda-api';

export const validateCreatePresignedUpload = async ({ body }: Request) => {
  const attributes = clean(body);
  return validate(attributes, createPresignedUploadSchema);
};