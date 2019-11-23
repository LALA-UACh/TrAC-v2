import { dbAuth, dbLALA, dbTracking } from "@db";

// TODO: Specify nullable fields

export interface IProgramTable {
  id: number;
  name: string;
  desc: string;
  state: string;
}

export const ProgramTable = dbLALA<IProgramTable>("program");

// -------------------------------------------------------------------------------------

export interface ICourseTable {
  code: string;
  name: string;
  description: string;
}

export const CourseTable = dbLALA<ICourseTable>("course");

// -------------------------------------------------------------------------------------

export interface IProgramStructureTable {
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

export const ProgramStructureTable = dbLALA<IProgramStructureTable>(
  "program_structure"
);

// -------------------------------------------------------------------------------------

export interface IStudentProgramTable {
  id: number;
  student_id: string;
  program_id: string;
  curriculum: number;
  start_year: number;
  mention: string;
}

export const StudentProgramTable = dbLALA<IStudentProgramTable>(
  "student_program"
);

// -------------------------------------------------------------------------------------

export interface IStudentTermTable {
  id: number;
  student_id: string;
  year: number;
  term: string;
  situation: string;
  t_gpa: number;
  c_gpa: number;
  notes: never;
}

export const StudentTermTable = dbLALA<IStudentTermTable>("student_term");

// -------------------------------------------------------------------------------------

export interface IStudentCourseTable {
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

export const StudentCourseTable = dbLALA<IStudentCourseTable>("student_course");

// -------------------------------------------------------------------------------------

export interface IUserTable {
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

export const UserTable = dbAuth<IUserTable>("users");

// -------------------------------------------------------------------------------------

export interface IUserProgramsTable {
  email: string;
  program: string;
}

export const UserProgramsTableName = "user-programs";

export const UserProgramsTable = dbAuth<IUserProgramsTable>(
  UserProgramsTableName
);

// -------------------------------------------------------------------------------------

export interface ITrackTable {
  id: number;

  app_id: string;

  user_id: string;

  datetime: Date;

  datetime_client: Date;

  data: string;
}

export const TrackingTable = dbTracking<ITrackTable>("tracking");

// -------------------------------------------------------------------------------------
