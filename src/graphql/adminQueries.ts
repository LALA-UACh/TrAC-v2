import gql, { DocumentNode } from "graphql-tag-ts";

import { UserType } from "@constants";
import { Program } from "@entities/program";
import { User } from "@entities/user";
import { IfImplements } from "@typings/utils";

export const allUsersAdmin: DocumentNode<{
  users: IfImplements<
    {
      email: string;
      name: string;
      tries: number;
      type: UserType;
      rut_id?: string;
      show_dropout: boolean;
      locked: boolean;
      programs: { id: number }[];
    },
    User
  >[];
}> = gql`
  query {
    users {
      email
      name
      tries
      type
      rut_id
      show_dropout
      locked
      programs {
        id
      }
    }
  }
`;

export const allProgramsAdmin: DocumentNode<{
  programs: IfImplements<{ id: number }, Program>[];
}> = gql`
  query {
    programs {
      id
    }
  }
`;

export const addUsersProgramsAdmin: DocumentNode<
  {
    addUsersPrograms: IfImplements<
      {
        email: string;
        name: string;
        tries: number;
        type: UserType;
        rut_id?: string;
        show_dropout: boolean;
        locked: boolean;
        programs: { id: number }[];
      },
      User
    >[];
  },
  {
    user_programs: {
      email: string;
      program: number;
    }[];
  }
> = gql`
  mutation($user_programs: [UserProgram!]!) {
    addUsersPrograms(user_programs: $user_programs) {
      email
      name
      tries
      type
      rut_id
      show_dropout
      locked
      programs {
        id
      }
    }
  }
`;

export const updateUserProgramsAdmin: DocumentNode<
  {
    updateUserPrograms: IfImplements<
      {
        email: string;
        name: string;
        tries: number;
        type: UserType;
        rut_id?: string;
        show_dropout: boolean;
        locked: boolean;
        programs: { id: number }[];
      },
      User
    >[];
  },
  {
    update_user: {
      email: string;
      programs: number[];
      oldPrograms: number[];
    };
  }
> = gql`
  mutation($update_user: UpdateUserPrograms!) {
    updateUserPrograms(userPrograms: $update_user) {
      email
      name
      tries
      type
      rut_id
      show_dropout
      locked
      programs {
        id
      }
    }
  }
`;

export const adminUpsertUsers: DocumentNode<
  {
    upsertUsers: IfImplements<
      {
        email: string;
        name: string;
        tries: number;
        type: UserType;
        rut_id?: string;
        show_dropout: boolean;
        locked: boolean;
        programs: { id: number }[];
      },
      User
    >[];
  },
  {
    users: {
      oldEmail?: string;
      email: string;
      name?: string;
      type?: UserType;
      tries?: number;
      rut_id?: string;
      show_dropout?: boolean;
      locked?: boolean;
    }[];
  }
> = gql`
  mutation($users: [UpsertedUser!]!) {
    upsertUsers(users: $users) {
      email
      name
      tries
      type
      rut_id
      show_dropout
      locked
      programs {
        id
      }
    }
  }
`;
