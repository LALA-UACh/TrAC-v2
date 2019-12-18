import { dbData } from "../";

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

export const COURSE_TABLE = "course";

export const CourseTable = () => dbData<ICourse>(COURSE_TABLE);

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

export const COURSE_STATS_TABLE = "course_stats";

export const CourseStatsTable = () => dbData<ICourseStats>(COURSE_STATS_TABLE);

// -------------------------------------------------------------------------------------

export interface IParameter {
  passing_grade: number;
  loading_date: Date;
}

export const PARAMETER_TABLE = "parameter";

export const ParameterTable = () => dbData<IParameter>(PARAMETER_TABLE);

// -------------------------------------------------------------------------------------

export interface IProgram {
  id: string;
  name: string;
  desc: string;
  tags: string;
  active: boolean;
  last_gpa: number;
}

export const PROGRAM_TABLE = "program";

export const ProgramTable = () => dbData<IProgram>(PROGRAM_TABLE);

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

export const PROGRAM_STRUCTURE_TABLE = "program_structure";

export const ProgramStructureTable = () =>
  dbData<IProgramStructure>(PROGRAM_STRUCTURE_TABLE);

// -------------------------------------------------------------------------------------

export interface IStudent {
  id: string;
  name: string;
  state: string;
}

export const STUDENT_TABLE = "student";

export const StudentTable = () => dbData<IStudent>(STUDENT_TABLE);

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

export const STUDENT_COURSE_TABLE = "student_course";

export const StudentCourseTable = () =>
  dbData<IStudentCourse>(STUDENT_COURSE_TABLE);

// -------------------------------------------------------------------------------------
export interface IStudentDropout {
  student_id: string;
  prob_dropout?: number;
  weight_per_semester?: string;
  active: boolean;
  model_accuracy?: number;
}

export const STUDENT_DROPOUT_TABLE = "student_dropout";

export const StudentDropoutTable = () =>
  dbData<IStudentDropout>(STUDENT_DROPOUT_TABLE);

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

export const STUDENT_PROGRAM_TABLE = "student_program";

export const StudentProgramTable = () =>
  dbData<IStudentProgram>(STUDENT_PROGRAM_TABLE);

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

export const STUDENT_TERM_TABLE = "student_term";

export const StudentTermTable = () => dbData<IStudentTerm>(STUDENT_TERM_TABLE);
