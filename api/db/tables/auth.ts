import { dbAuth } from "../";

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
