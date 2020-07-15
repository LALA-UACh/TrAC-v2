import type { $NonMaybeType } from "utility-types";
import { isValid } from "date-fns";

export function assertIsDefined<T = unknown>(
  value: T,
  message: string
): asserts value is $NonMaybeType<T> {
  if (value === undefined || value === null) {
    const error = new Error(message);
    Error.captureStackTrace(error, assertIsDefined);

    throw error;
  }
}

export function assertIsValidDate<T>(
  date: T | Date,
  nameParam: string
): asserts date is Date {
  if (isValid(date)) {
    return;
  }

  const error = new Error(`Error: "${nameParam}" is not a valid Date.`);

  Error.captureStackTrace(error, assertIsValidDate);

  throw error;
}
