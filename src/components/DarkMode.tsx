import {
  disable as disableDarkMode,
  enable as enableDarkMode,
  setFetchMethod,
} from "darkreader";
import React, { FC, memo, useEffect } from "react";
import ToggleTheme from "react-toggle-theme";

import { Box, BoxProps } from "@chakra-ui/core";

import { SVG_TEXT } from "../../constants";
import { Theme, ThemeStore } from "../context/Theme";

if (typeof window !== "undefined" && typeof window.fetch !== "undefined") {
  setFetchMethod(window.fetch);
}

const DarkMode: FC<BoxProps & { render?: boolean }> = memo(
  ({ render = true, ...props }) => {
    const theme = ThemeStore.hooks.useTheme();

    useEffect(() => {
      if (!ThemeStore.actions.checkLocalStorage().hasLocalStorage) {
        if (
          typeof window !== "undefined" &&
          window?.matchMedia("(prefers-color-scheme: dark)")?.matches
        ) {
          ThemeStore.actions.setTheme(Theme.DARK);
        }
      }
    }, []);

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

        .secondaryBlock {
          color: white !important;
        }
  
        th, td, header, section, .mainBlock, .ui.modal > * {
          background-color: #181A1B !important;
          color: white !important;
        }

        .info_popover * {
          background: #3182CE !important;
          color: white !important;
        }

        .error_popover * {
          background-color: #E53E3E !important;
          background: #E53E3E !important;
          color: white !important; 
        }

        .white_popover * {
          background: white !important;
          color: black !important;
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
        .foreplanCourseCheckboxIndirect > label:before {
          opacity: 0.5;
        }
        .waffleContainer {
          border-color: white !important;
          border-width: 1px !important;
        } 
        
        `,
          }
        );
      } else {
        disableDarkMode();
      }
    }, [theme]);

    return render ? (
      <Box {...props}>
        <ToggleTheme
          id="toggleTheme"
          selectedTheme={theme}
          onChange={ThemeStore.actions.setTheme}
        />
      </Box>
    ) : null;
  }
);

export default DarkMode;
