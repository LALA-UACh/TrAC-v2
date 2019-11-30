import { dbAuth, dbConfig, dbData, dbTracking } from "./";

// TODO: Specify nullable fields

export interface IProgram {
  id: number;
  name: string;
  desc: string;
  state: string;
}

export const ProgramTable = () => dbData<IProgram>("program");

// -------------------------------------------------------------------------------------

export interface ICourse {
  code: string;
  name: string;
  description: string;
}

export const CourseTable = () => dbData<ICourse>("course");

// -------------------------------------------------------------------------------------

export interface IProgramStructure {
  id: number;
  program_id: number;
  curriculum: number;
  semester: number;
  code: string;
  credits: number;
  creditsSCT: number;
  requisites: string;
  mention: string;
  course_cat: string;
  mode: string;
}

export const ProgramStructureTable = () =>
  dbData<IProgramStructure>("program_structure");

// -------------------------------------------------------------------------------------

export interface IStudentProgram {
  id: number;
  student_id: string;
  program_id: number;
  curriculum: number;
  start_year: number;
  mention: string;
}

export const StudentProgramTable = () =>
  dbData<IStudentProgram>("student_program");

// -------------------------------------------------------------------------------------

export interface IStudentTerm {
  id: number;
  student_id: string;
  year: number;
  term: string;
  situation: string;
  t_gpa: number;
  c_gpa: number;
  notes: never;
}

export const StudentTermTable = () => dbData<IStudentTerm>("student_term");

// -------------------------------------------------------------------------------------

export interface IStudentCourse {
  id: number;
  year: number;
  term: string;
  student_id: string;
  course_taken: string;
  course_equiv: string;
  elect_equiv: string;
  registration: string;
  state: string;
  grade: number;
  pgroup: number;
}

export const StudentCourseTable = () =>
  dbData<IStudentCourse>("student_course");

// -------------------------------------------------------------------------------------

export interface IStudentDropout {
  student_id: string;
  prob_dropout: number;
  model_accuracy: number;
  active: boolean;
}

export const StudentDropoutTable = () =>
  dbData<IStudentDropout>("student_dropout");

// -------------------------------------------------------------------------------------

export const USERS_TABLE = "users";
export interface IUser {
  email: string;
  password: string;
  name: string;
  oldPassword1: string;
  oldPassword2: string;
  oldPassword3: string;
  locked: boolean;
  tries: number;
  unlockKey: string;
  admin: boolean;
  type: string;
  rut_id: string;
  show_dropout: boolean;
}

export const UserTable = () => dbAuth<IUser>(USERS_TABLE);

// -------------------------------------------------------------------------------------

export interface IUserPrograms {
  email: string;
  program: string;
}

export const USER_PROGRAMS_TABLE = "user-programs";

export const UserProgramsTable = () =>
  dbAuth<IUserPrograms>(USER_PROGRAMS_TABLE);

// -------------------------------------------------------------------------------------

export interface ITrack {
  id: number;

  app_id: string;

  user_id: string;

  datetime: Date;

  datetime_client: Date;

  data: string;
}

export const TRACKING_TABLE = "tracking";

export const TrackingTable = () => dbTracking<ITrack>(TRACKING_TABLE);

// -------------------------------------------------------------------------------------

interface IConfiguration {
  name: string;
  value: string;
}

export const CONFIGURATION_TABLE = "configuration";
export const ConfigurationTable = () =>
  dbConfig<IConfiguration>(CONFIGURATION_TABLE);
