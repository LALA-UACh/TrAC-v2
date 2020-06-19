import type { $NonMaybeType } from "utility-types";

export function assertIsDefined<T = unknown>(
  value: T,
  message: string
): asserts value is $NonMaybeType<T> {
  if (value === undefined || value === null) {
    throw new Error(message);
  }
}
