import gql, { DocumentNode } from "graphql-tag-ts";

import { UserType } from "../../constants";
import { UserConfig } from "../../constants/userConfig";
import { IfImplements } from "../../typings/utils";
import { Program, User } from "./medium";

type IUsersAdmin = IfImplements<
  {
    email: string;
    name: string;
    tries: number;
    type: UserType;
    student_id?: string;
    locked: boolean;
    programs: { id: string }[];
    config: UserConfig;
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

export const ALL_USERS_ADMIN: DocumentNode<{
  users: IUsersAdmin[];
}> = gql`
  query {
    users {
      ...UserAdminFragment
    }
  }
  ${UserAdminFragment}
`;

export const ALL_PROGRAMS_ADMIN: DocumentNode<{
  programs: IfImplements<{ id: string }, Program>[];
}> = gql`
  query {
    programs {
      id
    }
  }
`;

export const ADD_USERS_PROGRAMS_ADMIN: DocumentNode<
  {
    addUsersPrograms: IUsersAdmin[];
  },
  {
    user_programs: {
      email: string;
      program: string;
    }[];
  }
> = gql`
  mutation($user_programs: [UserProgram!]!) {
    addUsersPrograms(user_programs: $user_programs) {
      ...UserAdminFragment
    }
  }
  ${UserAdminFragment}
`;

export const UPDATE_USER_PROGRAMS_ADMIN: DocumentNode<
  {
    updateUserPrograms: IUsersAdmin[];
  },
  {
    update_user: {
      email: string;
      programs: string[];
      oldPrograms: string[];
    };
  }
> = gql`
  mutation($update_user: UpdateUserPrograms!) {
    updateUserPrograms(userPrograms: $update_user) {
      ...UserAdminFragment
    }
  }
  ${UserAdminFragment}
`;

export const UPSERT_USERS_ADMIN: DocumentNode<
  {
    upsertUsers: IUsersAdmin[];
  },
  {
    users: {
      oldEmail?: string;
      email: string;
      name?: string;
      type?: UserType;
      tries?: number;
      student_id?: string;
      config?: UserConfig;
      locked?: boolean;
    }[];
  }
> = gql`
  mutation($users: [UpsertedUser!]!) {
    upsertUsers(users: $users) {
      ...UserAdminFragment
    }
  }
  ${UserAdminFragment}
`;

export const DELETE_USER_ADMIN: DocumentNode<
  {
    deleteUser: IUsersAdmin[];
  },
  {
    email: string;
  }
> = gql`
  mutation($email: EmailAddress!) {
    deleteUser(email: $email) {
      ...UserAdminFragment
    }
  }
  ${UserAdminFragment}
`;

export const LOCK_MAIL_USER_ADMIN: DocumentNode<
  {
    lockMailUser: {
      mailResult: Record<string, any>;
      users: IUsersAdmin[];
    };
  },
  { email: string }
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

export const MAIL_LOCKED_USERS_ADMIN: DocumentNode<{
  mailAllLockedUsers: Record<string, any>[];
}> = gql`
  mutation {
    mailAllLockedUsers
  }
`;
