export const WRONG_INFO = "WRONG_INFO";
export const USED_OLD_PASSWORD = "USED_OLD_PASSWORD";
export const LOCKED_USER = "LOCKED_USER";
export const STUDENT_NOT_FOUND = "STUDENT_NOT_FOUND";
export const STUDENT_LIST_UNAUTHORIZED = "STUDENT_LIST_UNAUTHORIZED";
export const PROGRAM_UNAUTHORIZED = "PROGRAM_UNAUTHORIZED";
export const PROGRAM_NOT_FOUND = "PROGRAM_NOT_FOUND";

export const PERSISTENCE_VERSION_PREFIX = "TrAC_V2";

export const NODE_ENV = (() => {
  switch (process.env.NODE_ENV) {
    case "development":
    case "production":
    case "test":
      return process.env.NODE_ENV;
    default:
      console.warn(`Environment not specified! "production" set by default.`);
      return "production";
  }
})();

export const IS_PRODUCTION = NODE_ENV === "production";
export const IS_NOT_PRODUCTION = !IS_PRODUCTION;

export const IS_DEVELOPMENT = NODE_ENV === "development";
export const IS_NOT_DEVELOPMENT = !IS_DEVELOPMENT;

export const IS_TEST = NODE_ENV === "test";
export const IS_NOT_TEST = !IS_TEST;

export const GRAPHQL_URL =
  typeof window === "undefined"
    ? `${process.env.DOMAIN || "http://localhost:3000"}/api/graphql`
    : "/api/graphql";

export enum StateCourse {
  Passed = "Passed",
  Failed = "Failed",
  Current = "Current",
  Canceled = "Canceled",
  Pending = "Pending",
}

export enum UserType {
  Director = "Director",
  Student = "Student",
}

export enum TermType {
  First = "First",
  Second = "Second",
  Anual = "Anual",
}

export enum FeedbackQuestionType {
  OpenText = "OpenText",
  SingleAnswer = "SingleAnswer",
  MultipleAnswer = "MultipleAnswer",
}

export const defaultUserType = (type?: string): UserType => {
  switch (type) {
    case "director":
    case UserType.Director:
      return UserType.Director;
    case "student":
    case UserType.Student:
      return UserType.Student;
    default:
      return UserType.Student;
  }
};

export const defaultStateCourse = (type?: string): StateCourse => {
  switch (type) {
    case StateCourse.Passed:
    case "A":
      return StateCourse.Passed;
    case StateCourse.Failed:
    case "R":
      return StateCourse.Failed;
    case StateCourse.Current:
    case "C":
      return StateCourse.Current;
    case StateCourse.Canceled:
    case "N":
      return StateCourse.Canceled;
    case StateCourse.Pending:
    case "P":
      return StateCourse.Pending;
    default:
      return StateCourse.Pending;
  }
};

export const defaultTermType = (type?: string | number): TermType => {
  switch (type) {
    case TermType.First:
    case "1":
    case 1:
      return TermType.First;
    case TermType.Second:
    case "2":
    case 2:
      return TermType.Second;
    case TermType.Anual:
    case "3":
    case 3:
      return TermType.Anual;
    default:
      return TermType.Anual;
  }
};

export const termTypeToNumber = (type?: string): number => {
  switch (type) {
    case TermType.First:
      return 1;
    case TermType.Second:
      return 2;
    case TermType.Anual:
      return 3;
    default:
      return 0;
  }
};

export const SVG_TEXT = "svg_text";

export enum PerformanceLoadUnit {
  Credits = "Credits",
}

export const defaultPerformanceLoadUnit = (
  unit?: string
): PerformanceLoadUnit => {
  switch (unit?.toLowerCase()) {
    case PerformanceLoadUnit.Credits:
    default: {
      return PerformanceLoadUnit.Credits;
    }
  }
};

export const NO_ANSWER = "NO_ANSWER";

export const OPTIONS_FEEDBACK_SPLIT_CHAR = "|";

export const OPTIONS_FEEDBACK_VALUE_SPLIT_CHAR = "=";
