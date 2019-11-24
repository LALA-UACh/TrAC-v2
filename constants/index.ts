export const WRONG_INFO = "WRONG_INFO";
export const USED_OLD_PASSWORD = "USED_OLD_PASSWORD";
export const LOCKED_USER = "LOCKED_USER";
export const GRAPHQL_URL =
  typeof window === "undefined"
    ? `${process?.env?.DOMAIN ?? "http://localhost:3000"}/api/graphql`
    : "/api/graphql";
export const HISTORIC_GRADES = "Calificaciones históricas";
export const GRADES_SCALES = "Escala de notas";
export const PROGRAM_PGA = "PGA de carrera";
export const DROPOUT_PREDICTION = "Predicción de abandono";
export const DROPOUT_PREDICTION_DESCRIPTION =
  "El sistema estima una probabilidad de abandono de";
export const DROPOUT_PREDICTION_ACCURACY = "acierto del modelo:";

export enum StateCourse {
  Passed = "A",
  Failed = "R",
  Current = "C",
  Canceled = "N",
  Pending = "P",
}

export enum UserType {
  Director = "Director",
  Student = "Student",
}

export enum TermType {
  First = "1",
  Second = "2",
  Anual = "3",
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

export const PSP_COLOR = "rgb(70,130,180)";
export const PGA_COLOR = "rgb(173,66,244)";
export const PROGRAM_PGA_COLOR = "rgb(102,102,102)";
