import { useRouter } from "next/router";
import { useEffect } from "react";
import { useQuery } from "react-apollo";

import { currentUser } from "@graphql/queries";

export default () => {
  const { data, loading } = useQuery<{ current_user?: { email: string } }>(
    currentUser,
    { ssr: false }
  );
  const { push } = useRouter();
  useEffect(() => {
    if (!loading && data && data?.current_user?.email) {
      push("/");
    }
  }, [loading, data]);

  if (loading || !data) {
    return <div>Current User Loading...</div>;
  }
  return <div>login</div>;
};
