import { $NonMaybeType } from "utility-types";

import { StateCourse, TermType, UserType } from "@constants";

export const defaultUserType = (type?: string): UserType => {
  switch (type) {
    case UserType.Director:
    case UserType.Student:
      return type;
    default:
      return UserType.Student;
  }
};

export const defaultStateCourse = (type?: string): StateCourse => {
  switch (type) {
    case StateCourse.Passed:
    case StateCourse.Failed:
    case StateCourse.Current:
    case StateCourse.Canceled:
    case StateCourse.Pending:
      return type;
    default:
      return StateCourse.Pending;
  }
};

export const defaultTermType = (type?: string): TermType => {
  switch (type) {
    case TermType.First:
    case TermType.Second:
    case TermType.Anual:
      return type;
    default:
      return TermType.Anual;
  }
};

export function assertIsDefined<T = unknown>(
  value: T,
  message: string
): asserts value is $NonMaybeType<T> {
  if (value === undefined || value === null) {
    throw new Error(message);
  }
}
