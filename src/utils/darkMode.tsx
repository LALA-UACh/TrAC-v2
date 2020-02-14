import {
  disable as disableDarkMode,
  enable as enableDarkMode,
} from "darkreader";
import React, { FC, memo, useEffect } from "react";
import ToggleTheme, { Theme } from "react-toggle-theme";
import { useRememberState } from "use-remember-state";

import { Box, BoxProps } from "@chakra-ui/core";

import { SVG_TEXT } from "../../constants";

const DarkMode: FC<BoxProps> = memo(({ ...props }) => {
  const [theme, setTheme] = useRememberState("TrAC-theme", Theme.LIGHT);

  useEffect(() => {
    if (window?.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme(Theme.DARK);
    }
  }, [setTheme]);

  useEffect(() => {
    if (theme === Theme.DARK) {
      enableDarkMode(
        {
          mode: 1,
          contrast: 100,
          brightness: 100,
          grayscale: 0,
          sepia: 0,
        },
        {
          invert: [SVG_TEXT],
          css: `
        .${SVG_TEXT} {
          fill: white;
        }
         
        [class^="react-select__option"] {
          color: white !important;
        }
  
        .ui.icon.secondary.left.labeled.button {
          border: 1px solid white !important;
        }
  
        .item {
          background-color: #3a3c3d !important;
          color: white !important;
        }
  
        th, td, header, section, .courseBox {
          background-color: #181A1B !important;
          color: white !important;
        }

        [class^="styles_toggleContainer"] {
          background-color: #536dfe !important;
        }

        [class^="styles_circle"] {
          background-color: #01579b !important;
          border-color: #fafafa !important;
        }

        [class^="styles_moon"] {
          color: #fff !important;
          fill: #fff !important;
        }

        img {
          background-color: white !important;
          padding: 5px;
          border-radius: 5px;
        }
        .ui.toggle.checkbox input:checked~.box, .ui.toggle.checkbox input:checked~label {
          color: #fff !important;
        }
        label {
          color: #fff !important;
        }
        `,
        }
      );
    } else {
      disableDarkMode();
    }
  }, [theme]);

  return (
    <Box {...props}>
      <ToggleTheme id="toggleTheme" selectedTheme={theme} onChange={setTheme} />
    </Box>
  );
});

export default DarkMode;
