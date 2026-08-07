import Joi from 'joi';

/**
 * Joi validation schema for the order feature.
 * Schema is a factory so a fresh instance is created per request.
 */

/** Create: a valid customer email and a positive amount are required. */
export const createOrder = () => Joi.object().keys({
  customerEmail: Joi.string().email().required().label('CustomerEmail'),
  amount: Joi.number().positive().required().label('Amount'),
});
