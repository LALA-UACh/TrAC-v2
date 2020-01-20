import { WatchQueryFetchPolicy } from "apollo-client";
import Router from "next/router";

import { useQuery } from "@apollo/react-hooks";

import { CURRENT_USER, IUserData } from "../graphql/queries";

export function useUser(
  {
    requireAuth = false,
    fetchPolicy = "cache-first",
    requireAdmin = false,
  }: {
    requireAuth?: boolean;
    fetchPolicy?: WatchQueryFetchPolicy;
    requireAdmin?: boolean;
  } = {
    fetchPolicy: "cache-first",
    requireAdmin: false,
    requireAuth: false,
  }
): { user?: IUserData; loading?: boolean } {
  const { loading, error, data } = useQuery(CURRENT_USER, {
    ssr: false,
    fetchPolicy,
  });

  const user = data?.currentUser?.user;

  if (error) {
    console.error(JSON.stringify(error, null, 2));
    throw error;
  }

  if ((requireAuth && !user) || (requireAdmin && !user?.admin)) {
    if (!loading) {
      if (user) {
        Router.push("/");
      } else {
        Router.push("/login");
      }
    }
    return { user: undefined, loading: true };
  }

  return { user, loading };
}
