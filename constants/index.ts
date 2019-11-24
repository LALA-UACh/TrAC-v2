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

export const HISTORIC_GRADES = "Calificaciones históricas";
export const GRADES_SCALES = "Escala de notas";
export const DROPOUT_PREDICTION = "Predicción de abandono";
export const DROPOUT_PREDICTION_DESCRIPTION =
  "El sistema estima una probabilidad de abandono de";
export const DROPOUT_PREDICTION_ACCURACY = "acierto del modelo:";

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

export const FLOW_CIRCLE_COLOR = "rgb(245,101,101)";
export const FLOW_CIRCLE_LABEL = "Fluj";

export const REQ_CIRCLE_LABEL = "Req";
export const REQ_CIRCLE_COLOR = "rgb(66,153,225)";

export const ACTIVE_COURSE_BOX_COLOR = "gray.500";
export const FLOW_COURSE_BOX_COLOR = "red.400";
export const REQUISITE_COURSE_BOX_COLOR = "blue.400";
export const EXPLICIT_SEMESTER_COURSE_BOX_COLOR = "yellow.400";
export const INACTIVE_COURSE_BOX_COLOR = "gray.400";

export const MIN_PASS_SCALE_COLOR = "#b0ffa1";
export const MAX_PASS_SCALE_COLOR = "#5bff3b";

export const MIN_FAIL_SCALE_COLOR = "#ff4040";
export const MAX_FAIL_SCALE_COLOR = "#ff8282";

export const STATE_COURSE_CURRENT_COLOR = "blue";
export const STATE_COURSE_CANCELED_COLOR = "white";
export const STATE_COURSE_PENDING_COLOR = "blue.300";
export const STATE_COURSE_CIRCLE_STROKE = "white";

export const COURSE_BOX_BACKGROUND_COLOR = "rgb(245,245,245)";
export const COURSE_BOX_TEXT_COLOR = "black";

export const DROPOUT_BACKGROUND_COLOR = "rgb(252,249,165)";
export const DROPOUT_TEXT_COLOR = "black";

export const HISTOGRAM_BAR_ACTIVE = "rgb(122,122,122)";
export const HISTOGRAM_BAR_INACTIVE = "rgb(191,191,191)";

export const SEARCH_BAR_BACKGROUND_COLOR = "rgb(52,58,64)";

export const TAKEN_SEMESTER_BOX_ACTIVE = "yellow.400";
export const TAKEN_SEMESTER_BOX_INACTIVE = "grey";
export const TAKEN_SEMESTER_BOX_BACKGROUND_COLOR = "rgb(245,245,245)";
export const TAKEN_SEMESTER_BOX_TEXT_COLOR = "black";

export const SEMESTER_HEADER_TEXT_COLOR = "rgb(70,130,180)";

export const TIMELINE_TOOLTIP_TEXT_COLOR = "rgb(255,255,255)";
export const TIMELINE_EXPLICIT_CIRCLE_COLOR = "rgb(236,201,75)";
export const TIMELINE_AXIS_COLOR = "black";
export const TIMELINE_AXIS_TEXT_COLOR = "black";
export const TIMELINE_PASS_LINE_COLOR = "black";

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
