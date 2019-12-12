import gql, { DocumentNode } from "graphql-tag-ts";

import { AuthResult } from "../../api/entities/auth";
import { baseConfig, StateCourse, TermType, UserType } from "../../constants";
import { IfImplements } from "../../typings/utils";
import { Program, Student, User } from "./medium";

export const UserFragment = gql`
  fragment UserFragment on User {
    email
    name
    admin
    type
    show_dropout
    show_student_list
  }
`;

export const LOGIN: DocumentNode<
  {
    login: {
      user?: {
        email: string;
        name: string;
        admin: boolean;
        type: UserType;
        show_dropout: boolean;
        show_student_list: boolean;
      };
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
        ...UserFragment
      }
      error
    }
  }
  ${UserFragment}
`;

export const CURRENT_USER: DocumentNode<{
  currentUser?: IfImplements<
    {
      user?: {
        email: string;
        name: string;
        admin: boolean;
        type: UserType;
        show_dropout: boolean;
        show_student_list: boolean;
      };
    },
    AuthResult
  >;
}> = gql`
  query {
    currentUser {
      user {
        ...UserFragment
      }
    }
  }
  ${UserFragment}
`;

export const UNLOCK: DocumentNode<
  {
    unlock: {
      user?: IfImplements<
        {
          email: string;
          name: string;
          admin: boolean;
          type: UserType;
          show_dropout: boolean;
          show_student_list: boolean;
        },
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
        ...UserFragment
      }
      error
    }
  }
  ${UserFragment}
`;

export const LOGOUT: DocumentNode<{
  logout: boolean;
}> = gql`
  mutation {
    logout
  }
`;

export const SEARCH_PROGRAM: DocumentNode<
  {
    program: IfImplements<
      {
        id: string;
        name: string;
        desc: string;
        active: boolean;
        curriculums: {
          id: string;
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
                label: string;
                value: number;
              }[];
              bandColors: { min: number; max: number; color: string }[];
            }[];
          }[];
        }[];
      },
      Program
    > | null;
  },
  { program_id?: string; student_id?: string }
> = gql`
  mutation($program_id: String, $student_id: String) {
    program(id: $program_id, student_id: $student_id) {
      id
      name
      desc
      active
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
              label
              value
            }
            bandColors {
              min
              max
              color
            }
          }
        }
      }
    }
  }
`;

export const SEARCH_STUDENT: DocumentNode<
  {
    student?: IfImplements<
      {
        id: string;
        programs: {
          id: string;
          name: string;
        }[];
        curriculums: string[];
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
              label: string;
              value: number;
            }>;
          }>;
        }>;
        dropout?: {
          prob_dropout: number;
          model_accuracy: number;
          active: boolean;
        };
      },
      Student
    >;
  },
  {
    student_id: string;
    program_id: string;
  }
> = gql`
  mutation($student_id: String!, $program_id: String!) {
    student(student_id: $student_id, program_id: $program_id) {
      id
      programs {
        id
        name
      }
      curriculums
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
            label
            value
          }
        }
      }
      dropout {
        prob_dropout
        model_accuracy
        active
      }
    }
  }
`;

export const MY_PROGRAMS: DocumentNode<{
  myPrograms: IfImplements<{ id: string; name: string }, Program>[];
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
