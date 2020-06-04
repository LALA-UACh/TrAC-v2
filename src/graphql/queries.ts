import gql, { DocumentNode } from "graphql-tag-ts";

import { StateCourse, TermType } from "../../constants";
import {
  Maybe,
  Mutation,
  MutationAnswerFeedbackFormArgs,
  MutationDirectTakeCoursesArgs,
  MutationIndirectTakeCoursesArgs,
  MutationLoginArgs,
  MutationPerformanceLoadAdvicesArgs,
  MutationProgramArgs,
  MutationSetPersistenceValueArgs,
  MutationStudentArgs,
  MutationTrackArgs,
  MutationUnlockArgs,
  PerformanceByLoad,
  Persistence,
  Program,
  Query,
  QueryGetPersistenceValueArgs,
  QueryStudentsArgs,
  Student,
  User,
} from "../../typings/graphql";
import { IfImplements } from "../../typings/utils";

export type IUserFragment = Pick<
  User,
  "email" | "name" | "admin" | "type" | "config" | "student_id"
>;

export const UserFragment = gql`
  fragment UserFragment on User {
    email
    name
    admin
    type
    config
    student_id
  }
`;

export const LOGIN: DocumentNode<
  IfImplements<
    { login: { user?: Maybe<IUserFragment>; error?: Maybe<string> } },
    Mutation
  >,
  MutationLoginArgs
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

export const CURRENT_USER: DocumentNode<IfImplements<
  {
    currentUser?: Maybe<{
      user?: Maybe<IUserFragment>;
    }>;
  },
  Query
>> = gql`
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
  IfImplements<
    {
      unlock?: Maybe<{
        user?: Maybe<IUserFragment>;
        error?: Maybe<string>;
      }>;
    },
    Mutation
  >,
  MutationUnlockArgs
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

export const LOGOUT: DocumentNode<IfImplements<
  {
    logout: boolean;
  },
  Mutation
>> = gql`
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
  IfImplements<
    {
      program: IProgramData;
    },
    Mutation
  >,
  MutationProgramArgs
> = gql`
  mutation($id: String, $student_id: String) {
    program(id: $id, student_id: $student_id) {
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
    dropout?: Maybe<{
      prob_dropout?: Maybe<number>;
      model_accuracy?: Maybe<number>;
      active: boolean;
    }>;
  },
  Student
>;

export const SEARCH_STUDENT: DocumentNode<
  IfImplements<
    {
      student?: Maybe<IStudentData>;
    },
    Mutation
  >,
  MutationStudentArgs
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

export const MY_PROGRAMS: DocumentNode<IfImplements<
  {
    myPrograms: { id: string; name: string }[];
  },
  Query
>> = gql`
  query {
    myPrograms {
      id
      name
    }
  }
`;

export const TRACK: DocumentNode<
  IfImplements<{ track: boolean }, Mutation>,
  MutationTrackArgs
> = gql`
  mutation($data: String!, $datetime_client: DateTime!) {
    track(data: $data, datetime_client: $datetime_client)
  }
`;

export const CONFIG_QUERY: DocumentNode<IfImplements<
  { config: Record<string, any> },
  Query
>> = gql`
  query {
    config
  }
`;

export const STUDENT_LIST: DocumentNode<
  IfImplements<
    {
      students: {
        id: string;
        progress: number;
        start_year: number;
        dropout?: Maybe<{
          prob_dropout?: Maybe<number>;
          explanation?: Maybe<string>;
        }>;
      }[];
    },
    Query
  >,
  QueryStudentsArgs
> = gql`
  query($program_id: String!) {
    students(program_id: $program_id) {
      id
      progress
      start_year
      dropout {
        prob_dropout
        explanation
      }
    }
  }
`;

export const PERFORMANCE_BY_LOAD_ADVICES: DocumentNode<
  IfImplements<
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
        | "clusterLabel"
        | "isStudentCluster"
      >[];
    },
    Mutation
  >,
  MutationPerformanceLoadAdvicesArgs
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
      clusterLabel
      isStudentCluster
    }
  }
`;

export const DIRECT_TAKE_COURSES: DocumentNode<
  IfImplements<
    {
      directTakeCourses: { id: number; code: string }[];
    },
    Mutation
  >,
  MutationDirectTakeCoursesArgs
> = gql`
  mutation($student_id: String, $program_id: String) {
    directTakeCourses(student_id: $student_id, program_id: $program_id) {
      id
      code
    }
  }
`;

export const INDIRECT_TAKE_COURSES: DocumentNode<
  IfImplements<
    {
      indirectTakeCourses: {
        course: { id: number; code: string };
        requisitesUnmet: string[];
      }[];
    },
    Mutation
  >,
  MutationIndirectTakeCoursesArgs
> = gql`
  mutation($student_id: String, $program_id: String) {
    indirectTakeCourses(student_id: $student_id, program_id: $program_id) {
      course {
        id
        code
      }
      requisitesUnmet
    }
  }
`;

export const GET_PERSISTENCE_VALUE: DocumentNode<
  IfImplements<
    {
      getPersistenceValue?: Pick<Persistence, "key" | "data"> | null;
    },
    Query
  >,
  QueryGetPersistenceValueArgs
> = gql`
  query($key: String!) {
    getPersistenceValue(key: $key) {
      key
      data
    }
  }
`;

export const SET_PERSISTENCE_VALUE: DocumentNode<
  IfImplements<
    {
      setPersistenceValue: {
        __typename?: "Persistence";
      };
    },
    Mutation
  >,
  MutationSetPersistenceValueArgs
> = gql`
  mutation($key: String!, $data: JSONObject!) {
    setPersistenceValue(key: $key, data: $data) {
      __typename
    }
  }
`;

export const UNANSWERED_FEEDBACK_FORM: DocumentNode<Pick<
  Query,
  "unansweredForm"
>> = gql`
  query {
    unansweredForm {
      id
      name
      priority
      questions {
        id
        question
        type
        priority
        options {
          text
          value
        }
      }
    }
  }
`;

export const ANSWER_FEEDBACK_FORM: DocumentNode<
  Pick<Mutation, "answerFeedbackForm">,
  MutationAnswerFeedbackFormArgs
> = gql`
  mutation($answer: FeedbackAnswerInput!) {
    answerFeedbackForm(answer: $answer)
  }
`;
