import { dbAuth, dbConfig, dbData, dbTracking } from "./";

export interface ICourse {
  id: string;
  name: string;
  description: string;
  tags: string;
  grading: string;
  grade_min: number;
  grade_max: number;
  grade_pass_min: number;
}

export const CourseTable = () => dbData<ICourse>("course");

// -------------------------------------------------------------------------------------
export interface ICourseStats {
  course_taken: string;
  year: number;
  term: number;
  p_group: number;
  n_total: number;
  n_finished: number;
  n_pass: number;
  n_fail: number;
  n_drop: number;
  histogram: string;
  avg_grade: number;
  n_grades: number;
  id: number;
  histogram_labels: string;
  color_bands: string;
}

export const CourseStatsTable = () => dbData<ICourseStats>("course_stats");

// -------------------------------------------------------------------------------------

export interface IParameter {
  passing_grade: number;
  loading_date: Date;
}

export const ParameterTable = () => dbData<IParameter>("parameter");

// -------------------------------------------------------------------------------------

export interface IProgram {
  id: string;
  name: string;
  desc: string;
  tags: string;
  active: boolean;
  last_gpa: number;
}

export const ProgramTable = () => dbData<IProgram>("program");

// -------------------------------------------------------------------------------------

export interface IProgramStructure {
  id: number;
  program_id: string;
  curriculum: string;
  semester: number;
  course_id: string;
  credits: number;
  requisites: string;
  mention: string;
  course_cat: string;
  mode: string;
  credits_sct: number;
  tags: string;
}

export const ProgramStructureTable = () =>
  dbData<IProgramStructure>("program_structure");

// -------------------------------------------------------------------------------------

export interface IStudent {
  id: string;
  name: string;
  state: string;
}

export const STUDENT_TABLE_NAME = "student";

export const StudentTable = () => dbData<IStudent>(STUDENT_TABLE_NAME);

// -------------------------------------------------------------------------------------

export interface IStudentCourse {
  id: number;
  year: number;
  term: number;
  student_id: string;
  course_taken: string;
  course_equiv: string;
  elect_equiv: string;
  registration: string;
  state: string;
  grade: number;
  p_group: number;
  comments: string;
  instructors: string;
  duplicates: number;
}

export const StudentCourseTable = () =>
  dbData<IStudentCourse>("student_course");

// -------------------------------------------------------------------------------------
export interface IStudentDropout {
  student_id: string;
  prob_dropout: number;
  weight_per_semester: string;
  active: boolean;
  model_accuracy: number;
}

export const StudentDropoutTable = () =>
  dbData<IStudentDropout>("student_dropout");

// -------------------------------------------------------------------------------------
export interface IStudentProgram {
  student_id: string;
  program_id: string;
  curriculum: string;
  start_year: number;
  mention: string;
  last_term: number;
  n_courses: number;
  n_passed_courses: number;
  completion: number;
}

export const STUDENT_PROGRAM_TABLE_NAME = "student_program";

export const StudentProgramTable = () =>
  dbData<IStudentProgram>(STUDENT_PROGRAM_TABLE_NAME);

// -------------------------------------------------------------------------------------

export interface IStudentTerm {
  id: number;
  student_id: string;
  year: number;
  term: number;
  situation: string;
  t_gpa: number;
  c_gpa: number;
  comments: string;
  program_id: string;
  curriculum: string;
  start_year: number;
  mention: string;
}

export const StudentTermTable = () => dbData<IStudentTerm>("student_term");

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
  student_id: string;
  show_dropout: boolean;
  show_student_list: boolean;
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
