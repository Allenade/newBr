import { type TryCatch } from "./try-catch";

export { type TryCatch };

export async function tryCatch<T, E = Error>(
  promise: Promise<T>,
): Promise<TryCatch.Result<T, E>> {
  try {
    const data = await promise;
    return {
      data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error as E,
    };
  }
}
