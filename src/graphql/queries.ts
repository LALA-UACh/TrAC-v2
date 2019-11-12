import gql from "graphql-tag";

export const currentUser = gql`
  query {
    current_user {
      email
      name
      admin
    }
  }
`;
