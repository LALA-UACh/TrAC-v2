import React, { FC } from "react";
import { Button, Icon } from "semantic-ui-react";

import { useMutation } from "@apollo/react-hooks";
import { Stack } from "@chakra-ui/core";

import { RESET_DATALOADERS_CACHE } from "../../../graphql/adminQueries";
import { Confirm } from "../../Confirm";

export const AdminData: FC = () => {
  const [resetDataLoadersCache, { loading }] = useMutation(
    RESET_DATALOADERS_CACHE
  );

  return (
    <Stack>
      <Confirm
        header="You are going to reset this API instance DataLoaders cache"
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
