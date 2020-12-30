import React, { FC } from "react";

import { Flex, Spinner, useColorMode } from "@chakra-ui/react";

export const LoadingPage: FC = () => {
  const isDark = useColorMode().colorMode === "dark";
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      height="100vh"
      width="100vw"
    >
      <Spinner color={isDark ? "white" : "black"} boxSize="xl" />
    </Flex>
  );
};
