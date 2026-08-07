import Joi from 'joi';
import { InterceptError } from './errorHelper';

/**
 * Validate a request payload against a Joi schema.
 *
 * @template T - shape of the validated payload (inferred at the call site).
 * @param attributes - cleaned request attributes (see `clean`)
 * @param validateFunction - factory returning a Joi schema; factories are used
 *   so a fresh schema instance is created per request
 * @returns the validated value, narrowed to `T` by the caller
 * @throws HTTP 400 with the Joi message when validation fails
 */
export const validate = <T = unknown>(attributes: unknown, validateFunction: () => Joi.Schema): T => {
  const { value, error } = validateFunction().validate(attributes, {
    allowUnknown: false, // reject fields the schema does not declare
    abortEarly: false,   // report ALL validation errors, not just the first
  });

  if (error) {
    throw InterceptError(error.message || 'Request validation error', 400);
  }

  return value as T;
};

/** Returns true when the value is `undefined`. */
export const isUndefined = (value: unknown): boolean => typeof value === 'undefined';

/**
 * Return a shallow copy of `obj` without the keys whose value satisfies `condition`.
 */
export const omitBy = <T>(obj: Record<string, T>, condition: (value: T) => boolean): Record<string, T> => {
  const result = { ...obj };
  for (const [key, value] of Object.entries(result)) {
    if (condition(value)) delete result[key];
  }
  return result;
};

/**
 * Strip keys with `undefined` values from an object (and normalise `undefined`
 * / `null` inputs to an empty object).
 *
 * Used before validation so that omitted optional request fields never trip the
 * schema's `allowUnknown: false`.
 */
export const clean = (object: Record<string, unknown> | undefined | null): Record<string, unknown> =>
  object ? omitBy(object, isUndefined) : {};
