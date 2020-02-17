import {
  disable as disableDarkMode,
  enable as enableDarkMode,
} from "darkreader";
import React, { FC, memo, useEffect } from "react";
import { createHook, createStore } from "react-sweet-state";
import ToggleTheme, { Theme } from "react-toggle-theme";

import { Box, BoxProps } from "@chakra-ui/core";

import { SVG_TEXT } from "../../constants";

const themePersistenceKey = "TrAC-theme";

const themeStore = createStore({
  initialState: (() => {
    try {
      if (localStorage.getItem(themePersistenceKey)) {
        return { theme: Theme.DARK };
      }
    } catch (err) {}
    return { theme: Theme.LIGHT };
  })(),
  actions: {
    setTheme: (theme: Theme) => ({ setState }) => {
      try {
        if (theme === Theme.DARK) {
          localStorage.setItem(themePersistenceKey, theme);
        } else {
          localStorage.removeItem(themePersistenceKey);
        }
      } catch (err) {}
      setState({ theme });
    },
  },
});

export const useTheme = createHook(themeStore, {
  selector: ({ theme }) => theme,
});

const DarkMode: FC<BoxProps & { render?: boolean }> = memo(
  ({ render = true, ...props }) => {
    const [theme, { setTheme }] = useTheme();

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

        .secondaryBlock {
          color: white !important;
        }
  
        th, td, header, section, .mainBlock, .ui.modal > * {
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
        .foreplanCourseCheckboxIndirect > label:before {
          opacity: 0.5;
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
          onChange={setTheme}
        />
      </Box>
    ) : null;
  }
);

export default DarkMode;
