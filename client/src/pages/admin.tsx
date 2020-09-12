import React, { FC, useEffect, useMemo } from "react";
import { Message } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

import { Flex, Stack } from "@chakra-ui/core";

import { IS_NOT_TEST } from "../../constants";
import { AdminConfig } from "../components/admin/BaseConfig";
import { AdminData } from "../components/admin/data/index";
import { AdminFeedback } from "../components/admin/feedback";
import { AdminMenu } from "../components/admin/Menu";
import { Programs } from "../components/admin/programs";
import { AdminTrack } from "../components/admin/track";
import { Users } from "../components/admin/users";
import { LoadingPage } from "../components/Loading";
import { useAllUsersAdminQuery } from "../graphql";
import { DarkMode } from "../utils/dynamicDarkMode";
import { useUser } from "../utils/useUser";

export enum AdminMenuTypes {
  users = "users",
  programs = "programs",
  baseConfig = "baseConfig",
  data = "data",
  feedback = "feedback",
  track = "track",
}

const Admin: FC = () => {
  const [active, setActive] = useRememberState<AdminMenuTypes>(
    "admin_menu_tab",
    AdminMenuTypes.users
  );

  const { data, loading, error, refetch } = useAllUsersAdminQuery({
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (IS_NOT_TEST && data) {
      console.log("data_all_users_admin", data);
    }
  }, [data]);

  const ActiveTab = useMemo(() => {
    switch (active) {
      case AdminMenuTypes.users:
        return (
          <Users
            users={data?.users ?? []}
            refetch={refetch}
            loading={loading}
          />
        );
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
      case AdminMenuTypes.feedback:
        return <AdminFeedback />;
      case AdminMenuTypes.track:
        return <AdminTrack />;
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
    <Stack alignItems="center" spacing="1em" padding="5px">
      <Flex position="absolute" justifyContent="flex-end" width="100%">
        <DarkMode p={3} />
      </Flex>
      <Flex>
        <AdminMenu active={active} setActive={setActive} />
      </Flex>
      {ActiveTab}
    </Stack>
  );
};

const AdminPage = () => {
  const { loading, user } = useUser({
    requireAuth: true,
    requireAdmin: true,
  });

  if (loading && !user) {
    return <LoadingPage />;
  }

  return <Admin />;
};

export default AdminPage;
