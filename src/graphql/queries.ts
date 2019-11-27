import gql, { DocumentNode } from "graphql-tag-ts";

import { baseConfig, StateCourse, TermType, UserType } from "../../constants";
import { IfImplements } from "../../typings/utils";
import { Program, Student, User } from "./medium";

export const loginMutation: DocumentNode<
  {
    login: {
      user?: { email: string; name: string; admin: boolean; type: UserType };
      error?: string;
    };
  },
  {
    email: string;
    password: string;
  }
> = gql`
  mutation($email: EmailAddress!, $password: String!) {
    login(email: $email, password: $password) {
      user {
        email
        name
        admin
        type
      }
      error
    }
  }
`;

export const currentUserQuery: DocumentNode<{
  currentUser?: IfImplements<
    {
      email: string;
      name: string;
      admin: boolean;
    },
    User
  >;
}> = gql`
  query {
    currentUser {
      email
      name
      admin
    }
  }
`;

export const unlockMutation: DocumentNode<
  {
    unlock: {
      user?: IfImplements<
        { email: string; name: string; admin: boolean },
        User
      >;
      error?: string;
    };
  },
  {
    email: string;
    password: string;
    unlockKey: string;
  }
> = gql`
  mutation($email: EmailAddress!, $password: String!, $unlockKey: String!) {
    unlock(email: $email, password: $password, unlockKey: $unlockKey) {
      user {
        email
        name
        admin
      }
      error
    }
  }
`;

export const logoutMutation: DocumentNode<{
  logout: boolean;
}> = gql`
  mutation {
    logout
  }
`;

export const searchProgramQuery: DocumentNode<
  {
    program: IfImplements<
      {
        id: number;
        name: string;
        desc: string;
        state: string;
        curriculums: {
          id: number;
          semesters: {
            id: number;
            courses: {
              code: string;
              name: string;
              credits: { label: string; value: number }[];
              mention: string;
              flow: { code: string }[];
              requisites: {
                code: string;
              }[];
              historicalDistribution: {
                min: number;
                max: number;
                value: number;
              }[];
            }[];
          }[];
        }[];
      },
      Program
    > | null;
  },
  { program_id: number }
> = gql`
  query($program_id: Int!) {
    program(id: $program_id) {
      id
      name
      desc
      state
      curriculums {
        id
        semesters {
          id
          courses {
            code
            name
            credits {
              label
              value
            }
            mention
            flow {
              code
            }
            requisites {
              code
            }
            historicalDistribution {
              min
              max
              value
            }
          }
        }
      }
    }
  }
`;

export const searchStudentQuery: DocumentNode<
  {
    student: IfImplements<
      {
        id: string;
        program: {
          id: number;
          name: string;
        };
        curriculum: number;
        start_year: number;
        mention: string;
        terms: Array<{
          id: number;
          student_id: string;
          year: number;
          term: TermType;
          situation: string;
          semestral_grade: number;
          cumulated_grade: number;
          program_grade: number;
          takenCourses: Array<{
            id: number;
            code: string;
            name: string;
            registration: string;
            grade: number;
            state: StateCourse;
            parallelGroup: number;
            currentDistribution: Array<{
              min: number;
              max: number;
              value: number;
            }>;
          }>;
        }>;
      },
      Student
    >;
  },
  {
    student_id: string;
    program_id?: number;
  }
> = gql`
  query($student_id: String!, $program_id: Int) {
    student(student_id: $student_id, program_id: $program_id) {
      id
      program {
        id
        name
      }
      curriculum
      start_year
      mention
      terms {
        id
        student_id
        year
        term
        situation
        semestral_grade
        cumulated_grade
        program_grade
        takenCourses {
          id
          code
          name
          registration
          grade
          state
          parallelGroup
          currentDistribution {
            min
            max
            value
          }
        }
      }
    }
  }
`;

export const myProgramsQuery: DocumentNode<{
  myPrograms: IfImplements<{ id: number; name: string }, Program>[];
}> = gql`
  query {
    myPrograms {
      id
      name
    }
  }
`;

export const trackMutation: DocumentNode<
  never,
  {
    datetime_client: Date;
    data: string;
  }
> = gql`
  mutation($data: String!, $datetime_client: DateTime!) {
    track(data: $data, datetime_client: $datetime_client)
  }
`;

export const configQuery: DocumentNode<{
  config: typeof baseConfig;
}> = gql`
  query {
    config
  }
`;
