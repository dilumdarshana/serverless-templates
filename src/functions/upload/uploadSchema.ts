import Joi from 'joi';

export const createPresignedUpload = () => Joi.object().keys({
  fileName: Joi.string().required().max(255).label('FileName'),
  contentType: Joi.string().optional().label('ContentType'),
});