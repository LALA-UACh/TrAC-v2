import { WatchQueryFetchPolicy } from "apollo-client";
import Router from "next/router";
import { useMemo } from "react";

import { useQuery } from "@apollo/react-hooks";

import { baseUserConfig, UserConfig } from "../../constants/userConfig";
import { CURRENT_USER, IUserFragment } from "../graphql/queries";

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
): {
  user?: (IUserFragment & { config: UserConfig }) | null;
  loading?: boolean;
} {
  const { loading, error, data } = useQuery(CURRENT_USER, {
    ssr: false,
    fetchPolicy,
  });

  const user = useMemo(() => {
    if (data?.currentUser?.user) {
      return {
        ...data.currentUser.user,
        config: {
          ...baseUserConfig,
          ...data.currentUser.user.config,
        },
      };
    }
    return undefined;
  }, [data]);

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
