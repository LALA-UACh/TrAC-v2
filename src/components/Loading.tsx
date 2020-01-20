import React, { FC } from "react";

import { Flex, Spinner } from "@chakra-ui/core";

export const LoadingPage: FC = () => {
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      height="100vh"
      width="100vw"
    >
      <Spinner size="xl" />
    </Flex>
  );
};
