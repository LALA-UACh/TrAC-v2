import { UserType } from "@constants";

export const defaultUserType = (type?: string): UserType => {
  switch (type) {
    case UserType.Director:
      return UserType.Director;
    default:
      return UserType.Student;
  }
};
