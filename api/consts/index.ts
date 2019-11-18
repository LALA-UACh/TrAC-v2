import ms from "ms";

export const SECRET =
  process.env.SECRET ??
  (() => {
    console.warn('Please use the "SECRET" environment variable!');
    return "Vzu93jvOF8huLwqw1u2JOZN1FYc5MRbxQgbKgId";
  })();
export const ONE_DAY = ms("1 day");
export const THIRTY_MINUTES = ms("30 mins");
export const ADMIN = "admin";
export const USER_PROGRAMS_TABLE = "user-programs";
export const USERS_TABLE = "users";
export const PROGRAM_TABLE = "program";
export const PROGRAM_STRUCTURE_TABLE = "program_structure";
export const COURSE_TABLE = "course";
export const STUDENT_PROGRAM_TABLE = "student_program";
