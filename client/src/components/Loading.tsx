import React, { FC } from "react";

import { Flex, Spinner } from "@chakra-ui/react";

import { useIsDark } from "../context/Theme";

export const LoadingPage: FC = () => {
  const isDark = useIsDark();
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      height="100vh"
      width="100vw"
    >
      <Spinner color={isDark ? "black" : undefined} boxSize="xl" />
    </Flex>
  );
};
