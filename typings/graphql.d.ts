export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  EmailAddress: string;
  JSONObject: Record<string,any>;
  DateTime: Date;
};

export type AuthResult = {
   __typename?: 'AuthResult';
  user?: Maybe<User>;
  error?: Maybe<Scalars['String']>;
  token?: Maybe<Scalars['String']>;
};

export type BandColor = {
   __typename?: 'BandColor';
  min: Scalars['Float'];
  max: Scalars['Float'];
  color: Scalars['String'];
};

export type Course = {
   __typename?: 'Course';
  id: Scalars['Float'];
  code: Scalars['String'];
  name: Scalars['String'];
  credits: Array<Credit>;
  mention: Scalars['String'];
  flow: Array<Course>;
  requisites: Array<Course>;
  historicalDistribution: Array<DistributionValue>;
  bandColors: Array<BandColor>;
};

export type Credit = {
   __typename?: 'Credit';
  label: Scalars['String'];
  value: Scalars['Int'];
};

export type Curriculum = {
   __typename?: 'Curriculum';
  id: Scalars['String'];
  semesters: Array<Semester>;
};


export type DistributionValue = {
   __typename?: 'DistributionValue';
  label: Scalars['String'];
  value: Scalars['Int'];
};

export type Dropout = {
   __typename?: 'Dropout';
  prob_dropout: Scalars['Float'];
  model_accuracy: Scalars['Float'];
  active: Scalars['Boolean'];
};


export type IndirectTakeCourse = {
   __typename?: 'IndirectTakeCourse';
  course: Course;
  requisitesUnmet: Array<Scalars['String']>;
};


export type LockedUserResult = {
   __typename?: 'LockedUserResult';
  mailResult: Scalars['JSONObject'];
  users: Array<User>;
};

export type MultipleLockedUserResult = {
   __typename?: 'MultipleLockedUserResult';
  mailResults: Array<Scalars['JSONObject']>;
  users: Array<User>;
};

export type Mutation = {
   __typename?: 'Mutation';
  login: AuthResult;
  logout: Scalars['Boolean'];
  unlock: AuthResult;
  setPersistenceValue: Persistence;
  resetPersistence: Scalars['Int'];
  resetDataLoadersCache: Scalars['Int'];
  editConfig: Scalars['JSONObject'];
  program: Program;
  student?: Maybe<Student>;
  performanceLoadAdvices: Array<PerformanceByLoad>;
  directTakeCourses: Array<Course>;
  indirectTakeCourses: Array<IndirectTakeCourse>;
  track: Scalars['Boolean'];
  updateUserPrograms: Array<User>;
  addUsersPrograms: Array<User>;
  upsertUsers: Array<User>;
  lockMailUser: LockedUserResult;
  mailAllLockedUsers: Array<Scalars['JSONObject']>;
  deleteUser: Array<User>;
};


export type MutationLoginArgs = {
  email: Scalars['EmailAddress'];
  password: Scalars['String'];
};


export type MutationUnlockArgs = {
  email: Scalars['EmailAddress'];
  password: Scalars['String'];
  unlockKey: Scalars['String'];
};


export type MutationSetPersistenceValueArgs = {
  data: Scalars['JSONObject'];
  key: Scalars['String'];
};


export type MutationResetPersistenceArgs = {
  user: Scalars['String'];
};


export type MutationEditConfigArgs = {
  value: Scalars['String'];
  name: Scalars['String'];
};


export type MutationProgramArgs = {
  student_id?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
};


export type MutationStudentArgs = {
  program_id?: Maybe<Scalars['String']>;
  student_id?: Maybe<Scalars['String']>;
};


export type MutationPerformanceLoadAdvicesArgs = {
  student_id?: Maybe<Scalars['String']>;
  program_id?: Maybe<Scalars['String']>;
};


export type MutationDirectTakeCoursesArgs = {
  student_id?: Maybe<Scalars['String']>;
  program_id?: Maybe<Scalars['String']>;
};


export type MutationIndirectTakeCoursesArgs = {
  student_id?: Maybe<Scalars['String']>;
  program_id?: Maybe<Scalars['String']>;
};


export type MutationTrackArgs = {
  datetime_client: Scalars['DateTime'];
  data: Scalars['String'];
};


export type MutationUpdateUserProgramsArgs = {
  userPrograms: UpdateUserPrograms;
};


export type MutationAddUsersProgramsArgs = {
  user_programs: Array<UserProgram>;
};


export type MutationUpsertUsersArgs = {
  users: Array<UpsertedUser>;
};


export type MutationLockMailUserArgs = {
  email: Scalars['EmailAddress'];
};


export type MutationDeleteUserArgs = {
  email: Scalars['EmailAddress'];
};

export type PerformanceByLoad = {
   __typename?: 'PerformanceByLoad';
  id: Scalars['Float'];
  loadUnit: PerformanceLoadUnit;
  lowerBoundary: Scalars['Float'];
  upperBoundary: Scalars['Float'];
  failRateLow: Scalars['Int'];
  failRateMid: Scalars['Int'];
  failRateHigh: Scalars['Int'];
  adviceTitle: Scalars['String'];
  adviceParagraph: Scalars['String'];
  clusterLabel: Scalars['String'];
  isStudentCluster: Scalars['Boolean'];
};

export enum PerformanceLoadUnit {
  Credits = 'Credits'
}

export type Persistence = {
   __typename?: 'Persistence';
  user: Scalars['String'];
  key: Scalars['String'];
  data: Scalars['JSONObject'];
  timestamp: Scalars['DateTime'];
};

export type Program = {
   __typename?: 'Program';
  id: Scalars['String'];
  name: Scalars['String'];
  desc: Scalars['String'];
  active: Scalars['Boolean'];
  lastGPA: Scalars['Float'];
  curriculums: Array<Curriculum>;
};

export type Query = {
   __typename?: 'Query';
  currentUser?: Maybe<AuthResult>;
  getPersistenceValue?: Maybe<Persistence>;
  userPersistences: Array<Persistence>;
  config: Scalars['JSONObject'];
  programs: Array<Program>;
  myPrograms: Array<Program>;
  students: Array<Student>;
  users: Array<User>;
};


export type QueryGetPersistenceValueArgs = {
  key: Scalars['String'];
};


export type QueryUserPersistencesArgs = {
  user: Scalars['String'];
};


export type QueryStudentsArgs = {
  last_n_years?: Maybe<Scalars['Int']>;
  program_id: Scalars['String'];
};

export type Semester = {
   __typename?: 'Semester';
  id: Scalars['Int'];
  courses: Array<Course>;
};

export enum StateCourse {
  Passed = 'Passed',
  Failed = 'Failed',
  Current = 'Current',
  Canceled = 'Canceled',
  Pending = 'Pending'
}

export type Student = {
   __typename?: 'Student';
  id: Scalars['ID'];
  name: Scalars['String'];
  state: Scalars['String'];
  programs: Array<Program>;
  curriculums: Array<Scalars['String']>;
  start_year: Scalars['Int'];
  mention: Scalars['String'];
  progress: Scalars['Float'];
  terms: Array<Term>;
  dropout?: Maybe<Dropout>;
};

export type TakenCourse = {
   __typename?: 'TakenCourse';
  id: Scalars['Int'];
  code: Scalars['String'];
  equiv: Scalars['String'];
  name: Scalars['String'];
  registration: Scalars['String'];
  grade: Scalars['Float'];
  state: StateCourse;
  parallelGroup: Scalars['Int'];
  currentDistribution: Array<DistributionValue>;
  bandColors: Array<BandColor>;
};

export type Term = {
   __typename?: 'Term';
  id: Scalars['Int'];
  student_id: Scalars['String'];
  year: Scalars['Int'];
  term: TermType;
  situation: Scalars['String'];
  comments: Scalars['String'];
  semestral_grade: Scalars['Float'];
  cumulated_grade: Scalars['Float'];
  program_grade: Scalars['Float'];
  takenCourses: Array<TakenCourse>;
};

export enum TermType {
  First = 'First',
  Second = 'Second',
  Anual = 'Anual'
}

export type Track = {
   __typename?: 'Track';
  id: Scalars['Float'];
  app_id: Scalars['String'];
  user_id: Scalars['String'];
  datetime: Scalars['DateTime'];
  datetime_client: Scalars['DateTime'];
  data: Scalars['String'];
};

export type UpdateUserPrograms = {
  email: Scalars['EmailAddress'];
  oldPrograms: Array<Scalars['String']>;
  programs: Array<Scalars['String']>;
};

export type UpsertedUser = {
  oldEmail?: Maybe<Scalars['EmailAddress']>;
  email: Scalars['EmailAddress'];
  name?: Maybe<Scalars['String']>;
  type?: Maybe<UserType>;
  config?: Maybe<Scalars['JSONObject']>;
  tries?: Maybe<Scalars['Float']>;
  student_id?: Maybe<Scalars['String']>;
  locked?: Maybe<Scalars['Boolean']>;
};

export type User = {
   __typename?: 'User';
  email: Scalars['EmailAddress'];
  name: Scalars['String'];
  admin: Scalars['Boolean'];
  type: UserType;
  student_id: Scalars['String'];
  locked: Scalars['Boolean'];
  tries: Scalars['Float'];
  unlockKey: Scalars['String'];
  programs: Array<Program>;
  config: Scalars['JSONObject'];
};

export type UserProgram = {
  email: Scalars['EmailAddress'];
  program: Scalars['String'];
};

export enum UserType {
  Director = 'Director',
  Student = 'Student'
}
