import Joi from 'joi';

/**
 * Joi validation schemas for the todo feature.
 * Schemas are factories so a fresh schema instance is created per request.
 */

/** Create: `task` is required. */
export const createTodo = () => Joi.object().keys({
  task: Joi.string().required().max(200).label('Task'),
});

/** Update: at least one field must be provided (`.min(1)`). */
export const updateTodo = () => Joi.object().keys({
  task: Joi.string().optional().max(200).label('Task'),
  status: Joi.string().valid('pending', 'completed').optional().label('Status'),
}).min(1);
