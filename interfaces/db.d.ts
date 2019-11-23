// TODO: Specify nullable fields

export interface ProgramTable {
  id: number;
  name: string;
  desc: string;
  state: string;
}

export interface CourseTable {
  code: string;
  name: string;
  description: string;
}

export interface ProgramStructureTable {
  id: number;
  program_id: number;
  curriculum: number;
  semester: string;
  code: string;
  credits: number;
  creditsSCT: number;
  requisites: string;
  mention: string;
  course_cat: string;
  mode: string;
}

export interface StudentProgramTable {
  id: number;
  student_id: string;
  program_id: string;
  curriculum: number;
  start_year: number;
  mention: string;
}

export interface StudentTermTable {
  id: number;
  student_id: string;
  year: number;
  term: string;
  situation: string;
  t_gpa: number;
  c_gpa: number;
  notes: never;
}

export interface StudentCourseTable {
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
