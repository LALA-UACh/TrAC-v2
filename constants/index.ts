export const WRONG_INFO = "WRONG_INFO";
export const USED_OLD_PASSWORD = "USED_OLD_PASSWORD";
export const LOCKED_USER = "LOCKED_USER";
export const GRAPHQL_URL =
  typeof window === "undefined"
    ? "http://localhost:3000/api/graphql"
    : "/api/graphql";
export const HISTORIC_GRADES = "Calificaciones históricas";
export const GRADES_SCALES = "Escala de notas";
export const PROGRAM_PGA = "PGA de carrera";
export const DROPOUT_PREDICTION = "Predicción de abandono";
export const DROPOUT_PREDICTION_DESCRIPTION =
  "El sistema estima una probabilidad de abandono de";
export const DROPOUT_PREDICTION_ACCURACY = "acierto del modelo:";
export enum State {
  Approved = "A",
  Reapproved = "R",
  Current = "C",
  Canceled = "N",
  Pending = "P"
}
