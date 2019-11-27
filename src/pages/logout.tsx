import Router from "next/router";
import { useEffect } from "react";

import { useMutation } from "@apollo/react-hooks";

import { currentUserQuery, logoutMutation } from "../graphql/queries";

export default () => {
  const [logout] = useMutation(logoutMutation, {
    ignoreResults: true,
    update: cache => {
      cache.writeQuery({
        query: currentUserQuery,
        data: { currentUser: null },
      });
    },
  });
  useEffect(() => {
    (async () => {
      await logout();
      Router.replace("/login");
    })();
  }, []);
  return null;
};
