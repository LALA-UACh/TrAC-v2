import { differenceInWeeks } from "date-fns";
import { toInteger } from "lodash";
import React, {
  createContext,
  Dispatch,
  FC,
  Reducer,
  ReducerState,
  useEffect,
  useReducer,
} from "react";
import { useDebounce, useUpdateEffect } from "react-use";

import { LAST_TIME_USED } from "../../../constants";
import { Action } from "../../../interfaces";
import { useUser } from "../../utils/useUser";

export type IForeplanActions =
  | Action<"activateForeplan">
  | Action<"disableForeplan">
  | Action<"addCourseForeplan", string>
  | Action<"removeCourseForeplan", string>
  | Action<"reset">;

export interface IForeplanData {
  active: boolean;
  foreplanCourses: Record<string, boolean>;
}

const defaultForeplanData: IForeplanData = {
  active: false,
  foreplanCourses: {},
};

const rememberForeplanDataKey = "TrAC_foreplan_data";

const initForeplanData = (
  initialData = defaultForeplanData
): ReducerState<typeof foreplanReducer> => {
  try {
    const rememberedData = localStorage.getItem(rememberForeplanDataKey);
    if (!rememberedData) return initialData;
    return { ...initialData, ...JSON.parse(rememberedData) };
  } catch (err) {
    return initialData;
  }
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
      return {
        ...state,
        foreplanCourses: { ...state.foreplanCourses, [action.payload]: true },
      };
    }
    case "removeCourseForeplan": {
      delete state.foreplanCourses[action.payload];
      return {
        ...state,
        foreplanCourses: { ...state.foreplanCourses },
      };
    }
    case "reset": {
      return defaultForeplanData;
    }
    default: {
      console.error("Foreplan action not handled!", action);
    }
  }
  return state;
};

export const ForeplanContext = createContext<
  IForeplanData & { dispatch: Dispatch<IForeplanActions> }
>({ ...defaultForeplanData, dispatch: () => {} });

export const ForeplanContextContainer: FC<{ distinct?: string }> = ({
  children,
  distinct,
}) => {
  const [state, dispatch] = useReducer(
    foreplanReducer,
    defaultForeplanData,
    initForeplanData
  );

  const { user } = useUser();

  useEffect(() => {
    if (state.active && !user?.config.FOREPLAN) {
      dispatch({
        type: "disableForeplan",
      });
    }
  }, [user, dispatch, state.active]);

  useEffect(() => {
    try {
      const lastTimeUsed = localStorage.getItem(LAST_TIME_USED);
      if (lastTimeUsed) {
        if (differenceInWeeks(toInteger(lastTimeUsed), Date.now()) >= 2) {
          dispatch({
            type: "reset",
          });
        }
      }
      localStorage.setItem(LAST_TIME_USED, Date.now().toString());
    } catch (err) {}
  }, [dispatch]);

  useUpdateEffect(() => {
    if (distinct) {
      dispatch({
        type: "reset",
      });
    }
  }, [distinct]);

  useDebounce(
    () => {
      try {
        if (user?.config.FOREPLAN)
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
