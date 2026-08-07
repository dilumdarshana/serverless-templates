/**
 * Generic helpers used across the project.
 */

/** Current time as an ISO-8601 UTC timestamp (the DynamoDB date format used). */
export const getCurrentTimestamp = (): string => new Date().toISOString();

/**
 * Generate a simple unique id (UUID v4).
 * Available on Node 18+ / Lambda runtimes via the global `crypto` object.
 */
export const generateId = (): string => crypto.randomUUID();
