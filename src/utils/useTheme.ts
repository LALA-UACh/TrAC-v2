import { createHook, createStore } from "react-sweet-state";

const themePersistenceKey = "TrAC-theme";

export enum Theme {
  DARK = "dark",
  LIGHT = "light",
}

const themeStore = createStore({
  initialState: { theme: Theme.LIGHT },
  actions: {
    setTheme: (theme: Theme) => ({ setState, getState }) => {
      try {
        localStorage.setItem(themePersistenceKey, theme);
      } catch (err) {}
      if (getState().theme !== theme) {
        setState({ theme });
      }
    },
    checkLocalStorage: () => ({ setState, getState }) => {
      try {
        const theme = localStorage.getItem(themePersistenceKey);
        if (theme) {
          if (theme === Theme.DARK || theme === Theme.LIGHT) {
            if (getState().theme !== theme) {
              setState({ theme });
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
});

export const useTheme = createHook(themeStore, {
  selector: ({ theme }) => theme,
});
