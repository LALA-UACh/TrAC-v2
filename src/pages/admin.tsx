import React, { FC, useEffect, useMemo } from "react";
import { Grid, Message } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

import { useQuery } from "@apollo/react-hooks";

import { AdminMenu } from "../components/admin/Menu";
import { Programs } from "../components/admin/programs";
import { Users } from "../components/admin/users";
import { LoadingPage } from "../components/Loading";
import { ALL_USERS_ADMIN } from "../graphql/adminQueries";
import { useUser } from "../utils/useUser";

const Admin: FC = () => {
  const [active, setActive] = useRememberState("admin_menu_tab", "users");

  const { data, loading, error } = useQuery(ALL_USERS_ADMIN);

  useEffect(() => {
    if (process.env.NODE_ENV !== "test" && data) {
      console.log("data_all_users_admin", data);
    }
  }, [data]);

  const ActiveTab = useMemo(() => {
    switch (active) {
      case "users":
        return <Users users={data?.users ?? []} />;
      case "programs":
        return (
          <Programs
            programs={
              data?.users.map(({ email, programs }) => {
                return { email, programs: programs.map(({ id }) => id) };
              }) || []
            }
          />
        );
      default:
        return null;
    }
  }, [active, data, loading]);

  if (error) {
    console.error(JSON.stringify(error, null, 2));
    return (
      <Message error>
        <Message.Content>{error.message}</Message.Content>
      </Message>
    );
  }

  return (
    <Grid centered>
      <Grid.Row>
        <AdminMenu active={active} setActive={setActive} />
      </Grid.Row>
      <Grid.Row>{ActiveTab}</Grid.Row>
    </Grid>
  );
};

export default () => {
  const { loading } = useUser({
    requireAuth: true,
    requireAdmin: true,
  });

  if (loading) {
    return <LoadingPage />;
  }

  return <Admin />;
};
