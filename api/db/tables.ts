import { dbAuth, dbConfig, dbLALA, dbTracking } from "./";

// TODO: Specify nullable fields

export interface IProgram {
  id: number;
  name: string;
  desc: string;
  state: string;
}

export const ProgramTable = () => dbLALA<IProgram>("program");

// -------------------------------------------------------------------------------------

export interface ICourse {
  code: string;
  name: string;
  description: string;
}

export const CourseTable = () => dbLALA<ICourse>("course");

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
  dbLALA<IProgramStructure>("program_structure");

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
  dbLALA<IStudentProgram>("student_program");

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

export const StudentTermTable = () => dbLALA<IStudentTerm>("student_term");

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
  dbLALA<IStudentCourse>("student_course");

// -------------------------------------------------------------------------------------

export interface IStudentDropout {
  student_id: string;
  prob_dropout: number;
  model_accuracy: number;
  active: boolean;
}

export const StudentDropoutTable = () =>
  dbLALA<IStudentDropout>("student_dropout");

// -------------------------------------------------------------------------------------

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

export const UserTable = () => dbAuth<IUser>("users");

// -------------------------------------------------------------------------------------

export interface IUserPrograms {
  email: string;
  program: string;
}

export const UserProgramsTableName = "user-programs";

export const UserProgramsTable = () =>
  dbAuth<IUserPrograms>(UserProgramsTableName);

// -------------------------------------------------------------------------------------

export interface ITrack {
  id: number;

  app_id: string;

  user_id: string;

  datetime: Date;

  datetime_client: Date;

  data: string;
}

export const TrackingTable = () => dbTracking<ITrack>("tracking");

// -------------------------------------------------------------------------------------

interface IConfiguration {
  name: string;
  value: string;
}

export const CONFIGURATION_TABLE = "configuration";
export const ConfigurationTable = () =>
  dbConfig<IConfiguration>(CONFIGURATION_TABLE);
