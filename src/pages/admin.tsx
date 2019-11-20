import { FC, useMemo } from "react";
import { Grid, Message } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

import { useQuery } from "@apollo/react-hooks";
import { AdminMenu } from "@components/admin/Menu";
import { Programs } from "@components/admin/programs";
import { Users } from "@components/admin/users";
import { RequireAuth } from "@components/RequireAuth";
import { allUsersAdmin } from "@graphql/adminQueries";

const Admin: FC = () => {
  const [active, setActive] = useRememberState("admin_menu_tab", "users");

  const { data, loading, error } = useQuery(allUsersAdmin);

  const UsersComponent = useMemo(() => {
    return <Users users={data?.users ?? []} />;
  }, [loading, data]);

  const ProgramsComponent = useMemo(() => {
    const programs =
      data?.users.map(({ email, programs }) => {
        console.log(email, programs);
        return { email, programs: programs.map(({ id }) => id) };
      }) ?? [];
    return <Programs programs={programs} />;
  }, [loading, data]);

  const ActiveTab = useMemo(() => {
    switch (active) {
      case "users":
        return UsersComponent;
      case "programs":
        return ProgramsComponent;
      default:
        return null;
    }
  }, [active, data, loading]);

  if (error) {
    console.error(JSON.stringify(error, null, 4));
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
  return (
    <RequireAuth admin>
      <Admin />
    </RequireAuth>
  );
};
