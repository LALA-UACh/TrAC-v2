import gql from "graphql-tag";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { useMutation } from "@apollo/react-hooks";
import { currentUser } from "@graphql/queries";

export default () => {
  const { replace } = useRouter();
  const [logout, { client }] = useMutation(
    gql`
      mutation {
        logout
      }
    `,
    { ignoreResults: true }
  );
  useEffect(() => {
    (async () => {
      await logout();
      client.writeQuery({
        query: currentUser,
        data: {
          current_user: null
        }
      });
      replace("/login");
    })();
  }, []);
  return null;
};
