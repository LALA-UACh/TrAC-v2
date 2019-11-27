export const WRONG_INFO = "WRONG_INFO";
export const USED_OLD_PASSWORD = "USED_OLD_PASSWORD";
export const LOCKED_USER = "LOCKED_USER";
export const GRAPHQL_URL =
  //@ts-ignore
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

const RANGE_GRADES = [
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

const MIN_GRADE = Math.min(...RANGE_GRADES.map(({ min }) => min));
const MAX_GRADE = Math.max(...RANGE_GRADES.map(({ max }) => max));

export const baseConfig = {
  HISTORIC_GRADES: "Calificaciones históricas",
  GRADES_SCALES: "Escala de notas",
  DROPOUT_PREDICTION: "Predicción de abandono",
  DROPOUT_PREDICTION_DESCRIPTION:
    "El sistema estima una probabilidad de abandono de",
  DROPOUT_PREDICTION_ACCURACY: "acierto del modelo:",
  SEMESTRAL_GRADE_COLOR: "rgb(70,130,180)",
  CUMULATED_GRADE_COLOR: "rgb(173,66,244)",
  PROGRAM_GRADE_COLOR: "rgb(102,102,102)",
  STATE_PASSED_LABEL_MINI: "AP",
  STATE_FAILED_LABEL_MINI: "RE",
  STATE_CANCELED_LABEL_MINI: "AN",
  STATE_PENDING_LABEL_MINI: "PEN",
  STATE_CURRENT_LABEL_MINI: "CUR",
  SEARCH_BUTTON_LABEL: "Buscar",
  LOGOUT_BUTTON_LABEL: "Salir",
  SEMESTRAL_GRADE_LABEL: "PSP",
  CUMULATED_GRADE_LABEL: "PGA",
  PROGRAM_GRADE_LABEL: "PGA de carrera",
  FLOW_CIRCLE_COLOR: "rgb(245,101,101)",
  FLOW_CIRCLE_LABEL: "Fluj",
  REQ_CIRCLE_LABEL: "Req",
  REQ_CIRCLE_COLOR: "rgb(66,153,225)",
  ACTIVE_COURSE_BOX_COLOR: "gray.500",
  FLOW_COURSE_BOX_COLOR: "red.400",
  REQUISITE_COURSE_BOX_COLOR: "blue.400",
  EXPLICIT_SEMESTER_COURSE_BOX_COLOR: "yellow.400",
  INACTIVE_COURSE_BOX_COLOR: "gray.400",
  MIN_PASS_SCALE_COLOR: "#b0ffa1",
  MAX_PASS_SCALE_COLOR: "#5bff3b",
  MIN_FAIL_SCALE_COLOR: "#ff4040",
  MAX_FAIL_SCALE_COLOR: "#ff8282",
  STATE_COURSE_CURRENT_COLOR: "blue",
  STATE_COURSE_CANCELED_COLOR: "white",
  STATE_COURSE_PENDING_COLOR: "blue.300",
  STATE_COURSE_CIRCLE_STROKE: "white",
  COURSE_BOX_BACKGROUND_COLOR: "rgb(245,245,245)",
  COURSE_BOX_TEXT_COLOR: "black",
  DROPOUT_BACKGROUND_COLOR: "rgb(252,249,165)",
  DROPOUT_TEXT_COLOR: "black",
  HISTOGRAM_BAR_ACTIVE: "rgb(122,122,122)",
  HISTOGRAM_BAR_INACTIVE: "rgb(191,191,191)",
  SEARCH_BAR_BACKGROUND_COLOR: "rgb(52,58,64)",
  TAKEN_SEMESTER_BOX_ACTIVE: "yellow.400",
  TAKEN_SEMESTER_BOX_INACTIVE: "grey",
  TAKEN_SEMESTER_BOX_BACKGROUND_COLOR: "rgb(245,245,245)",
  TAKEN_SEMESTER_BOX_TEXT_COLOR: "black",
  SEMESTER_HEADER_TEXT_COLOR: "rgb(70,130,180)",
  TIMELINE_TOOLTIP_TEXT_COLOR: "rgb(255,255,255)",
  TIMELINE_EXPLICIT_CIRCLE_COLOR: "rgb(236,201,75)",
  TIMELINE_AXIS_COLOR: "black",
  TIMELINE_AXIS_TEXT_COLOR: "black",
  TIMELINE_PASS_LINE_COLOR: "black",
  PASS_GRADE: 4,
  RANGE_GRADES,
  MIN_GRADE,
  MAX_GRADE,
};

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
