import { FC, useMemo } from "react";
import { Grid } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

import Menu from "@components/admin/Menu";
import Programs from "@components/admin/Programs";
import Users from "@components/admin/Users";
import { RequireAuth } from "@components/RequireAuth";

const Admin: FC = () => {
  const [active, setActive] = useRememberState("admin_menu_tab", "users");

  const ActiveTab = useMemo(() => {
    switch (active) {
      case "users":
        return <Users />;
      case "programs":
        return <Programs />;
      default:
        return null;
    }
  }, [active]);
  return (
    <Grid centered>
      <Grid.Row>
        <Menu active={active} setActive={setActive} />
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
