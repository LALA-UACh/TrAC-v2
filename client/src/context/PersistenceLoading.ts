import { createStore } from "react-state-selector";

export const {
  actions: { setIsForeplanLoading, setIsDashboardLoading },
  hooks: { useIsPersistenceLoading },
} = createStore(
  {
    isForeplanLoading: true,
    isDashboardLoading: true,
  },
  {
    devName: "PersistenceLoading",
    actions: {
      setIsForeplanLoading: (isLoading: boolean) => (draft) => {
        draft.isForeplanLoading = isLoading;
      },
      setIsDashboardLoading: (isLoading: boolean) => (draft) => {
        draft.isDashboardLoading = isLoading;
      },
    },
    hooks: {
      useIsPersistenceLoading: ({ isForeplanLoading, isDashboardLoading }) => {
        return isForeplanLoading || isDashboardLoading;
      },
    },
  }
);
