import Joi from 'joi';

/**
 * Joi validation schema for the upload feature.
 * Schema is a factory so a fresh instance is created per request.
 */

/** Create presigned URL: fileName required, contentType optional. */
export const createPresignedUpload = () => Joi.object().keys({
  fileName: Joi.string().required().max(255).label('FileName'),
  contentType: Joi.string().optional().label('ContentType'),
});
