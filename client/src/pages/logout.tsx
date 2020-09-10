import Router from "next/router";
import { useEffect } from "react";

import { LoadingPage } from "../components/Loading";
import { CurrentUserDocument, useLogoutMutation } from "../graphql";

const LogoutPage = () => {
  const [logout] = useLogoutMutation({
    ignoreResults: true,
    update: (cache) => {
      cache.writeQuery({
        query: CurrentUserDocument,
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

export default LogoutPage;
