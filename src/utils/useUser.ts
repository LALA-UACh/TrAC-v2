import { WatchQueryFetchPolicy } from "apollo-client";
import Router from "next/router";
import { useEffect, useMemo } from "react";

import { baseUserConfig, UserConfig } from "../../constants/userConfig";
import { useCurrentUserQuery, UserFragmentFragment } from "../graphql";

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
  user?: (UserFragmentFragment & { config: UserConfig }) | null;
  loading?: boolean;
  refetch: () => Promise<unknown>;
} {
  const { loading, error, data, refetch } = useCurrentUserQuery({
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

  useEffect(() => {
    if (
      process.env.NODE_ENV !== "test" &&
      ((requireAuth && !user) || (requireAdmin && !user?.admin))
    ) {
      if (!loading) {
        if (user) {
          Router.push("/");
        } else {
          Router.push("/login");
        }
      }
    }
  }, [loading, requireAuth, user, requireAdmin]);

  if ((requireAuth && !user) || (requireAdmin && !user?.admin)) {
    return { user: undefined, loading: true, refetch };
  }

  return { user, loading, refetch };
}
