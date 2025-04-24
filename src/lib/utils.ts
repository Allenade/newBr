import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Retrieves the first result from a query that returns an array of results.
 * If the array is empty, it returns null.
 *
 * @template T - The type of the items in the array.
 * @param {Promise<T[]>} query - A promise that resolves to an array of items.
 * @returns {Promise<T | null>} - A promise that resolves to the first item in the array, or null if the array is empty.
 */
export async function getSingle<T>(query: Promise<T[]>): Promise<T | null> {
  const results = await query;
  return results.length > 0 ? results[0] : null;
}

/**
 * Retrieves all results from a query that returns an array of results.
 * If the array is empty, it returns an empty array.
 *
 * @template T - The type of the items in the array.
 * @param {Promise<T[]>} query - A promise that resolves to an array of items.
 * @returns {Promise<T[]>} - A promise that resolves to the array of items.
 */
export async function getMany<T>(query: Promise<T[]>): Promise<T[]> {
  return await query;
}

/**
 * Generates a random DiceBear URL for group icons with a random seed.
 * @returns {string} A URL string for a DiceBear icon with a random seed.
 */
export function generateIconUrl(): string {
  const randomSeed = Math.random().toString(36).substring(2, 15); // Generate a random seed
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${randomSeed}`;
}

/**
 * Handles errors by logging and throwing them with an optional custom message.
 *
 * This function allows for flexibility in how errors are handled:
 * - If a `customMessage` is provided, it will log the custom message and throw an error with that message.
 * - If the `error` is an instance of `Error`, it will log the error message and rethrow the same error.
 * - For all other types of errors, it will log the error and throw a new error with a default message.
 *
 * @param {unknown} error The error to be handled. Can be of any type.
 * @param {string} [customMessage] An optional custom error message that overrides the default handling.
 *
 * @throws {Error} If a custom message is provided or if the error requires rethrowing after logging.
 */
export const handleError = (error: unknown, customMessage?: string) => {
  // ~ ======= if no error ======= ~
  if (!error) return;

  // ~ ======= if custom error  ======= ~
  if (customMessage) {
    console.error("[Custom Error]:", customMessage);
    console.error("[Original Error]:", error);
    throw new Error(customMessage);
  }

  // ~ ======= if its an instance of Error ======= ~
  if (error instanceof Error) {
    console.error("[Error]:", error.message);
    console.error("[Stack]:", error.stack);
    throw error;
  }

  // ~ ======= default ======= ~
  console.error("[Unknown Error]:", error);
  throw new Error("An unknown error occurred.");
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};
