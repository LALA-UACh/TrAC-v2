import Router from "next/router";
import { FC, useEffect } from "react";

import { useQuery } from "@apollo/react-hooks";

import { currentUserQuery } from "../graphql/queries";

export const RequireAuth: FC<{ admin?: boolean }> = ({ children, admin }) => {
  const { loading, error, data } = useQuery(currentUserQuery, {
    ssr: false,
  });

  useEffect(() => {
    if (!loading && data) {
      if (data?.currentUser?.user?.email) {
        if (admin && !data?.currentUser?.user?.admin) {
          Router.push("/");
        }
      } else {
        Router.push("/login");
      }
    }
  }, [loading, data, admin]);

  if (error) {
    return (
      <p style={{ whiteSpace: "pre" }}>{JSON.stringify(error, null, 4)}</p>
    );
  }
  if (
    loading ||
    !data ||
    !data?.currentUser?.user?.email ||
    (admin && !data?.currentUser?.user?.admin)
  ) {
    return null;
  }
  return <>{children}</>;
};
