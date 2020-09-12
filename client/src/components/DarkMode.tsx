import {
  disable as disableDarkMode,
  enable as enableDarkMode,
  setFetchMethod,
} from "darkreader";
import React, { FC, memo, useEffect } from "react";
import ToggleTheme from "react-toggle-theme";

import { Box, BoxProps } from "@chakra-ui/core";

import { SVG_TEXT } from "../../constants";
import {
  checkLocalStorage,
  setTheme,
  Theme,
  useIsDark,
  useTheme,
} from "../context/Theme";

if (typeof window !== "undefined" && typeof window.fetch !== "undefined") {
  setFetchMethod(window.fetch);
}

const DarkMode: FC<BoxProps & { render?: boolean }> = memo(
  ({ render = true, ...props }) => {
    const theme = useTheme();
    const isDarkMode = useIsDark();

    useEffect(() => {
      if (!checkLocalStorage().hasLocalStorage) {
        if (
          typeof window !== "undefined" &&
          window?.matchMedia("(prefers-color-scheme: dark)")?.matches
        ) {
          setTheme(Theme.DARK);
        }
      }
    }, []);

    useEffect(() => {
      if (isDarkMode) {
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
         
        [class^="react-select"] {
          color: white !important;
        }

        [id^="react-select"] {
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

        table, th, td {
          border: 1px solid white !important;
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

        textarea {
          background: white;
          color: black;
        }

        h2 {
          color: white;
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
            ignoreImageAnalysis: [],
            ignoreInlineStyle: [],
          }
        );
      } else {
        disableDarkMode();
      }
    }, [isDarkMode]);

    return render ? (
      <Box {...props}>
        <ToggleTheme
          id="toggleTheme"
          selectedTheme={theme}
          onChange={setTheme}
        />
      </Box>
    ) : null;
  }
);

export default DarkMode;
