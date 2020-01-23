import { differenceInWeeks } from "date-fns";
import { toInteger } from "lodash";
import { FC, useEffect } from "react";
import { createHook, createStore } from "react-sweet-state";
import { useDebounce, useUpdateEffect } from "react-use";

import { LAST_TIME_USED, StateCourse } from "../../../constants";
import { useUser } from "../../utils/useUser";

export interface IForeplanData {
  active: boolean;
  foreplanCourses: Record<string, boolean>;
}

const rememberForeplanDataKey = "TrAC_foreplan_data";

const initForeplanData = (initialData = defaultForeplanData): IForeplanData => {
  try {
    const rememberedData = localStorage.getItem(rememberForeplanDataKey);
    if (!rememberedData) return initialData;
    return { ...initialData, ...JSON.parse(rememberedData) };
  } catch (err) {
    return initialData;
  }
};

const defaultForeplanData: IForeplanData = {
  active: false,
  foreplanCourses: {},
};

const ForeplanStore = createStore({
  initialState: initForeplanData(),
  actions: {
    activateForeplan: () => ({ setState }) => {
      setState({
        active: true,
      });
    },
    disableForeplan: () => ({ setState }) => {
      setState({
        active: false,
      });
    },
    addCourseForeplan: (course: string) => ({ setState, getState }) => {
      setState({
        foreplanCourses: { ...getState().foreplanCourses, [course]: true },
      });
    },
    removeCourseForeplan: (course: string) => ({ setState, getState }) => {
      const {
        [course]: _value,
        ...foreplanCourses
      } = getState().foreplanCourses;
      setState({
        foreplanCourses,
      });
    },
    reset: () => ({ setState }) => {
      setState(defaultForeplanData);
    },
  },
  name: "ForeplanContext",
});

export const useForeplanData = createHook(ForeplanStore);

export const useIsForeplanCourseChecked = createHook(ForeplanStore, {
  selector: ({ foreplanCourses }, { code }: { code: string }) => {
    return !!foreplanCourses[code];
  },
});

export const useIsForeplanActive = createHook(ForeplanStore, {
  selector: ({ active }) => {
    return active;
  },
});

export const useIsPossibleToTakeForeplan = createHook(ForeplanStore, {
  selector: ({ active }, { state }: { state: StateCourse | undefined }) => {
    if (active) {
      switch (state) {
        case undefined:
        case StateCourse.Failed:
        case StateCourse.Canceled: {
          return true;
        }
        default:
      }
    }
    return false;
  },
});

export const ForeplanContextManager: FC<{ distinct?: string }> = ({
  distinct,
}) => {
  const [state, { reset, disableForeplan }] = useForeplanData();

  const { user } = useUser({
    fetchPolicy: "cache-only",
  });

  useEffect(() => {
    if (state.active && !user?.config.FOREPLAN) {
      disableForeplan();
    }
  }, [user, state.active, disableForeplan]);

  useEffect(() => {
    try {
      const lastTimeUsed = localStorage.getItem(LAST_TIME_USED);
      if (lastTimeUsed) {
        if (differenceInWeeks(toInteger(lastTimeUsed), Date.now()) >= 2) {
          reset();
        }
      }
      localStorage.setItem(LAST_TIME_USED, Date.now().toString());
    } catch (err) {}
  }, [reset]);

  useUpdateEffect(() => {
    if (distinct) {
      reset();
    }
  }, [distinct, reset]);

  useDebounce(
    () => {
      try {
        if (user?.config.FOREPLAN)
          localStorage.setItem(rememberForeplanDataKey, JSON.stringify(state));
      } catch (err) {}
    },
    5000,
    [state]
  );

  return null;
};
