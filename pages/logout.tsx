import Router from "next/router";
import { useEffect } from "react";

import { useMutation } from "@apollo/react-hooks";

import { LoadingPage } from "../src/components/Loading";
import { CURRENT_USER, LOGOUT } from "../src/graphql/queries";

export default () => {
  const [logout] = useMutation(LOGOUT, {
    ignoreResults: true,
    update: (cache) => {
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
  return <LoadingPage />;
};
