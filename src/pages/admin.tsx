import React, { FC, useEffect, useMemo } from "react";
import { Message } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

import { useQuery } from "@apollo/react-hooks";
import { Flex, Stack } from "@chakra-ui/core";

import { NODE_ENV } from "../../constants";
import { AdminConfig } from "../components/admin/BaseConfig";
import { AdminData } from "../components/admin/data/index";
import { AdminMenu } from "../components/admin/Menu";
import { Programs } from "../components/admin/programs";
import { Users } from "../components/admin/users";
import { LoadingPage } from "../components/Loading";
import { ALL_USERS_ADMIN } from "../graphql/adminQueries";
import { DarkMode } from "../utils/dynamicDarkMode";
import { useUser } from "../utils/useUser";

export enum AdminMenuTypes {
  users = "users",
  programs = "programs",
  baseConfig = "baseConfig",
  data = "data",
}

const Admin: FC = () => {
  const [active, setActive] = useRememberState<AdminMenuTypes>(
    "admin_menu_tab",
    AdminMenuTypes.users
  );

  const { data, loading, error } = useQuery(ALL_USERS_ADMIN);

  useEffect(() => {
    if (NODE_ENV !== "test" && data) {
      console.log("data_all_users_admin", data);
    }
  }, [data]);

  const ActiveTab = useMemo(() => {
    switch (active) {
      case AdminMenuTypes.users:
        return <Users users={data?.users ?? []} />;
      case AdminMenuTypes.programs:
        return (
          <Programs
            programs={
              data?.users.map(({ email, programs }) => {
                return { email, programs: programs.map(({ id }) => id) };
              }) || []
            }
          />
        );
      case AdminMenuTypes.baseConfig:
        return <AdminConfig />;
      case AdminMenuTypes.data:
        return <AdminData />;
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
    <Stack alignItems="center" height="100vh" spacing="1em">
      <Flex position="absolute" justifyContent="flex-end" width="100%">
        <DarkMode p={3} />
      </Flex>
      <Flex>
        <AdminMenu active={active} setActive={setActive} />
      </Flex>
      <Stack height="100%" overflowY="auto">
        {ActiveTab}
      </Stack>
    </Stack>
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
