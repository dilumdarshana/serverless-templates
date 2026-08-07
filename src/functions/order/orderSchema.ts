import Joi from 'joi';

export const createOrder = () => Joi.object().keys({
  customerEmail: Joi.string().email().required().label('CustomerEmail'),
  amount: Joi.number().positive().required().label('Amount'),
});
