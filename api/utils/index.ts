import { $NonMaybeType } from "utility-types";

import { StateCourse, UserType } from "@constants";

export const defaultUserType = (type?: string): UserType => {
  switch (type) {
    case UserType.Director:
      return UserType.Director;
    default:
      return UserType.Student;
  }
};

export const defaultStateCourse = (type?: string): StateCourse => {
  for (const possibleState of Object.values(StateCourse)) {
    if (type === possibleState) {
      return possibleState;
    }
  }
  return StateCourse.Pending;
};

export function assertIsDefined<T = unknown>(
  value: T,
  message: string
): asserts value is $NonMaybeType<T> {
  if (value === undefined || value === null) {
    throw new Error(message);
  }
}
