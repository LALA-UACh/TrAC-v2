import gql, { DocumentNode } from "graphql-tag-ts";

export const currentUser: DocumentNode<{
  current_user?: {
    email: string;
    name: string;
    admin: boolean;
  };
}> = gql`
  query {
    current_user {
      email
      name
      admin
    }
  }
`;
