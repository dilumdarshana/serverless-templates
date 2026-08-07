/**
 * Generic helpers used across the project.
 */

export const getCurrentTimestamp = (): string => new Date().toISOString();

/**
 * Generate a simple unique id (UUID v4).
 * Available in Node 18+ / Lambda runtimes.
 */
export const generateId = (): string => crypto.randomUUID();
