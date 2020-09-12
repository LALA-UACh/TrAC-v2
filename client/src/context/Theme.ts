import { createStore } from "react-state-selector";

const themePersistenceKey = "TrAC-theme";

export enum Theme {
  DARK = "dark",
  LIGHT = "light",
}

export const {
  hooks: { useTheme, useIsDark },
  actions: { setTheme, checkLocalStorage },
} = createStore(
  { theme: Theme.LIGHT, hasLocalStorage: false },
  {
    hooks: {
      useTheme: ({ theme }) => theme,
      useIsDark: ({ theme }) => theme === Theme.DARK,
    },
    actions: {
      setTheme: (theme: Theme) => (draft) => {
        try {
          localStorage.setItem(themePersistenceKey, theme);
        } catch (err) {}
        if (draft.theme !== theme) {
          draft.theme = theme;
        }
      },
      checkLocalStorage: () => (draft) => {
        try {
          const theme = localStorage.getItem(themePersistenceKey);
          if (theme) {
            draft.hasLocalStorage = true;
            if (theme === Theme.DARK || theme === Theme.LIGHT) {
              if (draft.theme !== theme) {
                draft.theme = theme;
              }
            } else {
              localStorage.removeItem(themePersistenceKey);
            }
          }
        } catch (err) {}
      },
    },
  }
);
