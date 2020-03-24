import gql, { DocumentNode } from "graphql-tag-ts";

import { UserType } from "../../constants";
import {
  FeedbackQuestionType,
  Mutation,
  MutationAddUsersProgramsArgs,
  MutationDeleteUserArgs,
  MutationEditConfigArgs,
  MutationLockMailUserArgs,
  MutationResetPersistenceArgs,
  MutationUpdateUserProgramsArgs,
  MutationUpsertUsersArgs,
  Program,
  Query,
  QueryFeedbackResultsArgs,
  QueryUserPersistencesArgs,
  User,
} from "../../typings/graphql";
import { IfImplements } from "../../typings/utils";

type IUsersAdmin = IfImplements<
  {
    email: string;
    name: string;
    tries: number;
    type: UserType;
    student_id?: string;
    locked: boolean;
    programs: { id: string }[];
    config: Record<string, unknown>;
  },
  User
>;

const UserAdminFragment = gql`
  fragment UserAdminFragment on User {
    email
    name
    tries
    type
    student_id
    config
    locked
    programs {
      id
    }
  }
`;

export const ALL_USERS_ADMIN: DocumentNode<IfImplements<
  {
    users: IUsersAdmin[];
  },
  Query
>> = gql`
  query {
    users {
      ...UserAdminFragment
    }
  }
  ${UserAdminFragment}
`;

export const ALL_PROGRAMS_ADMIN: DocumentNode<IfImplements<
  {
    programs: IfImplements<{ id: string }, Program>[];
  },
  Query
>> = gql`
  query {
    programs {
      id
    }
  }
`;

export const ADD_USERS_PROGRAMS_ADMIN: DocumentNode<
  IfImplements<
    {
      addUsersPrograms: IUsersAdmin[];
    },
    Mutation
  >,
  MutationAddUsersProgramsArgs
> = gql`
  mutation($user_programs: [UserProgram!]!) {
    addUsersPrograms(user_programs: $user_programs) {
      ...UserAdminFragment
    }
  }
  ${UserAdminFragment}
`;

export const UPDATE_USER_PROGRAMS_ADMIN: DocumentNode<
  IfImplements<
    {
      updateUserPrograms: IUsersAdmin[];
    },
    Mutation
  >,
  MutationUpdateUserProgramsArgs
> = gql`
  mutation($userPrograms: UpdateUserPrograms!) {
    updateUserPrograms(userPrograms: $userPrograms) {
      ...UserAdminFragment
    }
  }
  ${UserAdminFragment}
`;

export const UPSERT_USERS_ADMIN: DocumentNode<
  IfImplements<
    {
      upsertUsers: IUsersAdmin[];
    },
    Mutation
  >,
  MutationUpsertUsersArgs
> = gql`
  mutation($users: [UpsertedUser!]!) {
    upsertUsers(users: $users) {
      ...UserAdminFragment
    }
  }
  ${UserAdminFragment}
`;

export const DELETE_USER_ADMIN: DocumentNode<
  IfImplements<
    {
      deleteUser: IUsersAdmin[];
    },
    Mutation
  >,
  MutationDeleteUserArgs
> = gql`
  mutation($email: EmailAddress!) {
    deleteUser(email: $email) {
      ...UserAdminFragment
    }
  }
  ${UserAdminFragment}
`;

export const LOCK_MAIL_USER_ADMIN: DocumentNode<
  IfImplements<
    {
      lockMailUser: {
        mailResult: Record<string, any>;
        users: IUsersAdmin[];
      };
    },
    Mutation
  >,
  MutationLockMailUserArgs
> = gql`
  mutation($email: EmailAddress!) {
    lockMailUser(email: $email) {
      mailResult
      users {
        ...UserAdminFragment
      }
    }
  }
  ${UserAdminFragment}
`;

export const MAIL_LOCKED_USERS_ADMIN: DocumentNode<Pick<
  Mutation,
  "mailAllLockedUsers"
>> = gql`
  mutation {
    mailAllLockedUsers
  }
`;

export const EDIT_CONFIG: DocumentNode<
  Pick<Mutation, "editConfig">,
  MutationEditConfigArgs
> = gql`
  mutation($name: String!, $value: String!) {
    editConfig(name: $name, value: $value)
  }
`;

export const USER_PERSISTENCES: DocumentNode<
  IfImplements<
    {
      userPersistences: {
        key: string;
        data: Record<string, any>;
        timestamp: string;
      }[];
    },
    Query
  >,
  QueryUserPersistencesArgs
> = gql`
  query($user: String!) {
    userPersistences(user: $user) {
      key
      data
      timestamp
    }
  }
`;

export const RESET_PERSISTENCE: DocumentNode<
  Pick<Mutation, "resetPersistence">,
  MutationResetPersistenceArgs
> = gql`
  mutation($user: String!) {
    resetPersistence(user: $user)
  }
`;

export const RESET_DATALOADERS_CACHE: DocumentNode<Pick<
  Mutation,
  "resetDataLoadersCache"
>> = gql`
  mutation {
    resetDataLoadersCache
  }
`;

export const FEEDBACK_RESULTS_CSV: DocumentNode<Pick<
  Mutation,
  "feedbackResultsCsv"
>> = gql`
  mutation {
    feedbackResultsCsv
  }
`;

export const FEEDBACK_RESULTS: DocumentNode<
  IfImplements<
    {
      feedbackResults: {
        user: {
          email: string;
        };
        form: {
          name: string;
        };
        answers: {
          answer: string;
          question: {
            question: string;
            type: FeedbackQuestionType;
            options: {
              text: string;
              value: number;
            }[];
          };
        }[];
        timestamp: string;
      }[];
    },
    Query
  >,
  QueryFeedbackResultsArgs
> = gql`
  query($user_ids: [String!]) {
    feedbackResults(user_ids: $user_ids) {
      user {
        email
      }
      form {
        name
      }
      answers {
        answer
        question {
          question
          type
          options {
            text
            value
          }
        }
      }
      timestamp
    }
  }
`;
