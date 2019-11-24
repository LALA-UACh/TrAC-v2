export const WRONG_INFO = "WRONG_INFO";
export const USED_OLD_PASSWORD = "USED_OLD_PASSWORD";
export const LOCKED_USER = "LOCKED_USER";
export const GRAPHQL_URL =
  typeof window === "undefined"
    ? `${process?.env?.DOMAIN ?? "http://localhost:3000"}/api/graphql`
    : "/api/graphql";
export const CURRENT_DISTRIBUTION_LABEL = ({
  term,
  year,
}: {
  term: string | number;
  year: number;
}) => {
  return `Calificaciones ${term} ${year}`;
};
export const HISTORIC_GRADES = "Calificaciones históricas";
export const GRADES_SCALES = "Escala de notas";
export const DROPOUT_PREDICTION = "Predicción de abandono";
export const DROPOUT_PREDICTION_DESCRIPTION =
  "El sistema estima una probabilidad de abandono de";
export const DROPOUT_PREDICTION_ACCURACY = "acierto del modelo:";

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

export const rangeGrades = [
  {
    min: 1,
    max: 3.4,
    color: "#d6604d",
  },
  {
    min: 3.5,
    max: 3.9,
    color: "#f48873",
  },
  {
    min: 4,
    max: 4.4,
    color: "#a7dc78",
  },
  {
    min: 4.5,
    max: 7,
    color: "#66b43e",
  },
];
export const passGrade: number = 4;

export const minGrade = Math.min(...rangeGrades.map(({ min }) => min));
export const maxGrade = Math.max(...rangeGrades.map(({ max }) => max));

export const SEMESTRAL_GRADE_COLOR = "rgb(70,130,180)";
export const CUMULATED_GRADE_COLOR = "rgb(173,66,244)";
export const PROGRAM_GRADE_COLOR = "rgb(102,102,102)";

export const STATE_PASSED_LABEL_MINI = "AP";
export const STATE_FAILED_LABEL_MINI = "RE";
export const STATE_CANCELED_LABEL_MINI = "AN";
export const STATE_PENDING_LABEL_MINI = "PEN";
export const STATE_CURRENT_LABEL_MINI = "CUR";

export const SEARCH_BUTTON_LABEL = "Buscar";
export const LOGOUT_BUTTON_LABEL = "Salir";

export const SEMESTRAL_GRADE_LABEL = "PSP";
export const CUMULATED_GRADE_LABEL = "PGA";
export const PROGRAM_GRADE_LABEL = "PGA de carrera";

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

export const defaultTermType = (type?: string): TermType => {
  switch (type) {
    case TermType.First:
    case "1":
      return TermType.First;
    case TermType.Second:
    case "2":
      return TermType.Second;
    case TermType.Anual:
    case "3":
      return TermType.Anual;
    default:
      return TermType.Anual;
  }
};
