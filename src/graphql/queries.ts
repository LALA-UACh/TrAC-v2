import gql, { DocumentNode } from "graphql-tag-ts";

import { StateCourse, UserType } from "@constants";
import { Program } from "@entities/program";
import { Student } from "@entities/student";
import { User } from "@entities/user";
import { IfImplements } from "@typings/utils";

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
        courses: {
          code: string;
          name: string;
          credits: number;
          mention: string;
          semester: number;
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
      },
      Program
    >;
  },
  { program_id: number }
> = gql`
  query($program_id: Int!) {
    program(id: $program_id) {
      id
      name
      desc
      state
      courses {
        code
        name
        credits
        mention
        semester
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
          id: string;
          student_id: string;
          year: number;
          semester: number;
          situation: string;
          PSP: number;
          PGA: number;
          ProgramPGA: number;
          takenCourses: Array<{
            id: string;
            code: string;
            name: string;
            registration: string;
            grade: number;
            state: StateCourse;
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
        semester
        situation
        PSP
        PGA
        ProgramPGA
        takenCourses {
          id
          code
          name
          registration
          grade
          state
          historicalStates {
            state
            grade
          }
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
