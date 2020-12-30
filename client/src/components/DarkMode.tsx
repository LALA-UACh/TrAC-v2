import React, { FC, memo } from "react";
import ToggleTheme, { Theme } from "react-toggle-theme";

import { Box, BoxProps, useColorMode } from "@chakra-ui/react";

export const ToggleDarkMode: FC<BoxProps> = memo(({ ...props }) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box {...props}>
      <ToggleTheme
        id="toggleTheme"
        selectedTheme={colorMode === "dark" ? Theme.DARK : Theme.LIGHT}
        onChange={toggleColorMode}
      />
    </Box>
  );
});
