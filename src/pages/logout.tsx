import Router from "next/router";
import { useEffect } from "react";

import { useMutation } from "@apollo/react-hooks";

import { CURRENT_USER, LOGOUT } from "../graphql/queries";

export default () => {
  const [logout] = useMutation(LOGOUT, {
    ignoreResults: true,
    update: cache => {
      cache.writeQuery({
        query: CURRENT_USER,
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
