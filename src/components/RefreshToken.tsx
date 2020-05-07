import { FC, memo, useEffect } from "react";

import { useUser } from "../utils/useUser";

export const RefreshToken: FC = memo(() => {
  const { user, refetch } = useUser({
    fetchPolicy: "cache-first",
  });

  const userEmail = user?.email;
  useEffect(() => {
    if (userEmail) {
      const pollInterval = setInterval(() => {
        refetch();
      }, 1500000);

      return () => {
        clearInterval(pollInterval);
      };
    }
    return;
  }, [userEmail]);

  return null;
});
