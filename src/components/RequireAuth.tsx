import { useRouter } from "next/router";
import { FC, ReactElement, useEffect } from "react";

import { useQuery } from "@apollo/react-hooks";
import { currentUser } from "@graphql/queries";

export const RequireAuth: FC<{ children: ReactElement; admin?: boolean }> = ({
  children,
  admin
}) => {
  const { loading, error, data } = useQuery<{
    current_user?: { email: string; admin: boolean };
  }>(currentUser, { ssr: false });
  const { push } = useRouter();

  useEffect(() => {
    if (!loading && data) {
      if (data?.current_user?.email) {
        if (admin && !data?.current_user?.admin) {
          push("/");
        }
      } else {
        push("/login");
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
    (admin && !data?.current_user?.admin) ||
    !data?.current_user?.email
  ) {
    return null;
  }
  return children;
};
