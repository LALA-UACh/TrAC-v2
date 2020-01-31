import gql, { DocumentNode } from "graphql-tag-ts";

import { PerformanceByLoad } from "../../api/entities/data/foreplan";
import { Program } from "../../api/entities/data/program";
import { Student } from "../../api/entities/data/student";
import { StateCourse, TermType, UserType } from "../../constants";
import { baseConfig } from "../../constants/baseConfig";
import { UserConfig } from "../../constants/userConfig";
import { IfImplements } from "../../typings/utils";

export type IUserData = {
  email: string;
  name: string;
  admin: boolean;
  type: UserType;
  config: UserConfig;
};
export const UserFragment = gql`
  fragment UserFragment on User {
    email
    name
    admin
    type
    config
  }
`;

export const LOGIN: DocumentNode<
  {
    login: {
      user?: IUserData;
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
  currentUser?: {
    user?: IUserData;
  };
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
      user?: IUserData;
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

export type IProgramData = IfImplements<
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
>;

export const SEARCH_PROGRAM: DocumentNode<
  {
    program: IProgramData | null;
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

export type IStudentData = IfImplements<
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
      comments: string;
      takenCourses: Array<{
        id: number;
        code: string;
        equiv: string;
        name: string;
        registration: string;
        grade: number;
        state: StateCourse;
        parallelGroup: number;
        currentDistribution: Array<{
          label: string;
          value: number;
        }>;
        bandColors: { min: number; max: number; color: string }[];
      }>;
    }>;
    dropout?: {
      prob_dropout?: number;
      model_accuracy?: number;
      active: boolean;
    };
  },
  Student
>;

export const SEARCH_STUDENT: DocumentNode<
  {
    student?: IStudentData;
  },
  {
    student_id?: string;
    program_id?: string;
  }
> = gql`
  mutation($student_id: String, $program_id: String) {
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
        comments
        takenCourses {
          id
          code
          equiv
          name
          registration
          grade
          state
          parallelGroup
          currentDistribution {
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

export const TRACK: DocumentNode<
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

export const CONFIG_QUERY: DocumentNode<{
  config: typeof baseConfig;
}> = gql`
  query {
    config
  }
`;

export const STUDENT_LIST: DocumentNode<
  {
    students: IfImplements<
      {
        id: string;
        progress: number;
        start_year: number;
        dropout?: {
          prob_dropout?: number;
        };
      },
      Student
    >[];
  },
  {
    program_id: string;
  }
> = gql`
  query($program_id: String!) {
    students(program_id: $program_id) {
      id
      progress
      start_year
      dropout {
        prob_dropout
      }
    }
  }
`;

export const PERFORMANCE_BY_LOAD_ADVICES: DocumentNode<
  {
    performanceLoadAdvices: Pick<
      PerformanceByLoad,
      | "id"
      | "loadUnit"
      | "lowerBoundary"
      | "upperBoundary"
      | "failRateLow"
      | "failRateMid"
      | "failRateHigh"
      | "adviceTitle"
      | "adviceParagraph"
      | "label"
    >[];
  },
  {
    student_id?: string;
    program_id?: string;
  }
> = gql`
  mutation($student_id: String, $program_id: String) {
    performanceLoadAdvices(student_id: $student_id, program_id: $program_id) {
      id
      loadUnit
      lowerBoundary
      upperBoundary
      failRateLow
      failRateMid
      failRateHigh
      adviceTitle
      adviceParagraph
      label
    }
  }
`;

export const DIRECT_TAKE_COURSES: DocumentNode<{
  directTakeCourses: { id: number; code: string }[];
}> = gql`
  mutation($student_id: String, $program_id: String) {
    directTakeCourses(student_id: $student_id, program_id: $program_id) {
      id
      code
    }
  }
`;
