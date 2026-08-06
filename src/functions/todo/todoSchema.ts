import Joi from 'joi';

/**
 * Joi validation schemas for the todo feature.
 * Schemas are factories so they can be reused across requests.
 */

export const createTodo = () => Joi.object().keys({
  task: Joi.string().required().max(200).label('Task'),
});

export const updateTodo = () => Joi.object().keys({
  task: Joi.string().optional().max(200).label('Task'),
  status: Joi.string().valid('pending', 'completed').optional().label('Status'),
}).min(1);