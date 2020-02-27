import { createStore } from "react-state-selector";

const themePersistenceKey = "TrAC-theme";

export enum Theme {
  DARK = "dark",
  LIGHT = "light",
}

export const ThemeStore = createStore(
  { theme: Theme.LIGHT },
  {
    hooks: {
      useTheme: ({ theme }) => theme,
    },
    actions: {
      setTheme: (theme: Theme) => draft => {
        try {
          localStorage.setItem(themePersistenceKey, theme);
        } catch (err) {}
        if (draft.theme !== theme) {
          draft.theme = theme;
        }
      },
      checkLocalStorage: () => draft => {
        try {
          const theme = localStorage.getItem(themePersistenceKey);
          if (theme) {
            if (theme === Theme.DARK || theme === Theme.LIGHT) {
              if (draft.theme !== theme) {
                draft.theme = theme;
              }
              return true;
            } else {
              localStorage.removeItem(themePersistenceKey);
            }
          }
        } catch (err) {}
        return false;
      },
    },
  }
);
