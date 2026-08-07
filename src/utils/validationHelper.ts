import { InterceptError } from './errorHelper';

/**
 * Validate a request payload against a Joi schema.
 * @param attributes - cleaned request attributes
 * @param validateFunction - factory returning a Joi schema
 */
export const validate = async (attributes: unknown, validateFunction: () => any) => {
  const { value, error } = validateFunction().validate(attributes, {
    allowUnknown: false,
    abortEarly: false,
  });

  if (error) {
    const errorMsg = error.message || 'Request validation error';
    throw InterceptError(errorMsg, 400);
  }

  return value;
};

/**
 * Check whether a value is undefined.
 */
export const isUndefined = (value: unknown): boolean => typeof value === 'undefined';

/**
 * Omit object keys whose value satisfies a condition.
 */
export const omitBy = (obj: Record<string, any>, condition: (value: any) => boolean): Record<string, any> => {
  const result = { ...obj };
  Object.entries(result).forEach(([key, value]) => {
    if (condition(value)) delete result[key];
  });
  return result;
};

/**
 * Strip keys with undefined values from an object.
 */
export const clean = (object: Record<string, any> | undefined): Record<string, any> => (object ? omitBy(object, isUndefined) : {});
