import React, { FC } from "react";
import { Button, Icon } from "semantic-ui-react";

import { Stack } from "@chakra-ui/core";

import { useResetDataLoadersCacheAdminMutation } from "../../../graphql";
import { Confirm } from "../../Confirm";

export const AdminData: FC = () => {
  const [
    resetDataLoadersCache,
    { loading },
  ] = useResetDataLoadersCacheAdminMutation();

  return (
    <Stack>
      <Confirm
        header="You are going to reset all the API DataLoaders cache"
        content="This should only be done for testing response times or database runtime changes."
      >
        <Button
          loading={loading}
          disabled={loading}
          onClick={() => {
            resetDataLoadersCache();
          }}
          icon
          labelPosition="left"
          color="orange"
        >
          <Icon name="refresh" />
          Reset DataLoaders cache
        </Button>
      </Confirm>
    </Stack>
  );
};
