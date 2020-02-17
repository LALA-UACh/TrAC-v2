import { createHook, createStore } from "react-sweet-state";

const themePersistenceKey = "TrAC-theme";

export enum Theme {
  DARK = "dark",
  LIGHT = "light",
}

const themeStore = createStore({
  initialState: { theme: Theme.LIGHT },
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
    checkLocalStorage: () => ({ setState }) => {
      try {
        if (localStorage.getItem(themePersistenceKey)) {
          setState({ theme: Theme.DARK });
          return true;
        }
      } catch (err) {}
      return false;
    },
  },
});

export const useTheme = createHook(themeStore, {
  selector: ({ theme }) => theme,
});
