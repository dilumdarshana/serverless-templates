import { clean, validate } from '../../utils/validationHelper';
import { createPresignedUpload as createPresignedUploadSchema } from './uploadSchema';
import { Request } from 'lambda-api';
import { Attributes } from '../../controller';

/**
 * Validate the presigned-upload request body and return clean attributes.
 * @throws HTTP 400 when the body does not match the schema.
 */
export const validateCreatePresignedUpload = async ({ body }: Request): Promise<Attributes> => {
  const attributes = clean(body);
  return validate<Attributes>(attributes, createPresignedUploadSchema);
};
