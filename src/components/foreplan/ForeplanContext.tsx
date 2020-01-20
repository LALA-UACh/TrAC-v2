import React, {
  createContext,
  Dispatch,
  FC,
  Reducer,
  ReducerState,
  useReducer,
} from "react";
import { useDebounce } from "react-use";

import { Action } from "../../../interfaces";

export type IForeplanActions =
  | Action<"activateForeplan">
  | Action<"disableForeplan">
  | Action<"addCourseForeplan", string>
  | Action<"removeCourseForeplan", string>;

export interface IForeplanData {
  active: boolean;
  foreplanCourses: string[];
}

const defaultForeplanData: IForeplanData = {
  active: false,
  foreplanCourses: [],
};

const foreplanReducer: Reducer<IForeplanData, IForeplanActions> = (
  state,
  action
) => {
  switch (action.type) {
    case "activateForeplan": {
      return { ...state, active: true };
    }
    case "disableForeplan": {
      return { ...state, active: false };
    }
    case "addCourseForeplan": {
      action.payload;
      return state;
    }
    case "removeCourseForeplan": {
      action.payload;
      return state;
    }
    default: {
      console.error("Foreplan action not handled!", action);
    }
  }
  return state;
};

const rememberForeplanDataKey = "TrAC_foreplan_data";

const initForeplanData = (
  initialData = defaultForeplanData,
  remember = true
): ReducerState<typeof foreplanReducer> => {
  if (!remember) return initialData;

  try {
    const rememberedData = localStorage.getItem(rememberForeplanDataKey);
    if (!rememberedData) return initialData;
    return { ...initialData, ...JSON.parse(rememberedData) };
  } catch (err) {
    return initialData;
  }
};

export const ForeplanContext = createContext<
  IForeplanData & { dispatch: Dispatch<IForeplanActions> }
>({ ...defaultForeplanData, dispatch: () => {} });

export const ForeplanContextContainer: FC = ({ children }) => {
  const [state, dispatch] = useReducer(
    foreplanReducer,
    defaultForeplanData,
    initForeplanData
  );

  useDebounce(
    () => {
      try {
        localStorage.setItem(rememberForeplanDataKey, JSON.stringify(state));
      } catch (err) {}
    },
    3000,
    [state]
  );

  return (
    <ForeplanContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ForeplanContext.Provider>
  );
};
