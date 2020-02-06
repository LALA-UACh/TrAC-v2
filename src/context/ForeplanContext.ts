import { differenceInWeeks } from "date-fns";
import { reduce, size, toInteger } from "lodash";
import merge from "lodash/fp/merge";
import { FC, useEffect } from "react";
import { createHook, createStore } from "react-sweet-state";
import { useDebounce } from "react-use";

import { PerformanceByLoad } from "../../api/entities/data/foreplan";
import { LAST_TIME_USED, StateCourse } from "../../constants";
import { ICourse } from "../../interfaces";
import { stringListToBooleanMap } from "../utils";
import { useUser } from "../utils/useUser";

const emptyObject = Object.freeze({});

export type ICreditsNumber = { credits: number };

export interface IForeplanActiveData {
  active: boolean;
  foreplanCourses: Record<string, Pick<ICourse, "name"> & ICreditsNumber>;
  totalCreditsTaken: number;
  advices: PerformanceByLoad[];
}

export interface IForeplanHelperData {
  courseDirectTake: Record<string, boolean | undefined>;
  courseFailRate: Record<string, number>;
  courseEffort: Record<string, number>;
  futureCourseRequisites: {
    [coursesToOpen: string]:
      | { [requisite: string]: boolean | undefined }
      | undefined;
  };
}

const defaultForeplanHelperStore: IForeplanHelperData = {
  courseDirectTake: emptyObject,
  courseFailRate: emptyObject,
  courseEffort: emptyObject,
  futureCourseRequisites: emptyObject,
};

const ForeplanHelperStore = createStore({
  initialState: defaultForeplanHelperStore,
  actions: {
    setDirectTakeData: (data: string[]) => ({ setState }) => {
      setState({
        courseDirectTake: stringListToBooleanMap(data),
      });
    },
    setFailRateData: (data: { code: string; failRate: number }[]) => ({
      setState,
    }) => {
      setState({
        courseFailRate: data.reduce<Record<string, number>>(
          (acum, { code, failRate }) => {
            acum[code] = failRate;
            return acum;
          },
          {}
        ),
      });
    },
    setEffortData: (data: { code: string; effort: number }[]) => ({
      setState,
    }) => {
      setState({
        courseEffort: data.reduce<Record<string, number>>(
          (acum, { code, effort }) => {
            acum[code] = effort;
            return acum;
          },
          {}
        ),
      });
    },
    setNewFutureCourseRequisites: (course: string, requisites: string[]) => ({
      setState,
      getState,
    }) => {
      setState({
        futureCourseRequisites: {
          ...getState().futureCourseRequisites,
          [course]: requisites.reduce<Record<string, boolean>>(
            (acum, requisite) => {
              acum[requisite] = false;
              return acum;
            },
            {}
          ),
        },
      });
    },
    setFutureCourseRequisitesState: (
      courseToSetState: string,
      state: boolean
    ) => ({ setState, getState }) => {
      const futureCourseRequisites = getState().futureCourseRequisites;
      if (futureCourseRequisites) {
        for (const courseToOpen in futureCourseRequisites) {
          if (
            futureCourseRequisites[courseToOpen]?.[courseToSetState] !==
            undefined
          ) {
            futureCourseRequisites[courseToOpen] = {
              ...futureCourseRequisites[courseToOpen],
              [courseToSetState]: state,
            };
          }
        }
      }

      setState({
        futureCourseRequisites,
      });
    },
  },
});

export const useForeplanHelperData = createHook(ForeplanHelperStore);

export const useForeplanHelperActions = createHook(ForeplanHelperStore, {
  selector: null,
});

export const useForeplanIsDirectTake = createHook(ForeplanHelperStore, {
  selector: ({ courseDirectTake }, { code }: { code: string }) => {
    return (
      courseDirectTake[code] ||
      (courseDirectTake === emptyObject ? undefined : false)
    );
  },
});

export const useForeplanCourseFailRate = createHook(ForeplanHelperStore, {
  selector: ({ courseFailRate }, { code }: { code: string }) => {
    return courseFailRate[code] || 0;
  },
});

export const useForeplanCourseEffort = createHook(ForeplanHelperStore, {
  selector: ({ courseEffort }, { code }: { code: string }) => {
    return courseEffort[code] || 1;
  },
});

export const useForeplanAllFutureCourseRequisites = createHook(
  ForeplanHelperStore,
  {
    selector: ({ futureCourseRequisites }) => {
      return futureCourseRequisites;
    },
  }
);

export const useForeplanFutureCourseRequisites = createHook(
  ForeplanHelperStore,
  {
    selector: ({ futureCourseRequisites }, { code }: { code: string }) => {
      return futureCourseRequisites[code];
    },
  }
);

const rememberForeplanDataKey = "TrAC_foreplan_remember_local_data";

const initForeplanActiveData = (
  initialData = defaultForeplanActiveData
): IForeplanActiveData => {
  try {
    const rememberedData = localStorage.getItem(rememberForeplanDataKey);
    if (!rememberedData) return initialData;
    return { ...initialData, ...JSON.parse(rememberedData) };
  } catch (err) {
    return initialData;
  }
};

const defaultForeplanActiveData: IForeplanActiveData = {
  active: false,
  foreplanCourses: emptyObject,
  totalCreditsTaken: 0,
  advices: [],
};

const ForeplanActiveStore = createStore({
  initialState: initForeplanActiveData(),
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
    addCourseForeplan: (
      course: string,
      data: IForeplanActiveData["foreplanCourses"][string]
    ) => ({ setState, getState }) => {
      const foreplanCourses = { ...getState().foreplanCourses, [course]: data };
      const totalCreditsTaken = reduce(
        foreplanCourses,
        (acum, { credits }) => {
          return acum + credits;
        },
        0
      );

      setState({
        foreplanCourses,
        totalCreditsTaken,
      });
    },
    removeCourseForeplan: (course: string) => ({ setState, getState }) => {
      const {
        foreplanCourses: { [course]: deletedCourse, ...foreplanCourses },
      } = getState();
      const totalCreditsTaken = reduce(
        foreplanCourses,
        (acum, { credits }) => {
          return acum + credits;
        },
        0
      );
      setState({
        foreplanCourses,
        totalCreditsTaken,
      });
    },
    setForeplanAdvices: (advices: IForeplanActiveData["advices"]) => ({
      setState,
    }) => {
      setState({
        advices,
      });
    },
    reset: () => ({ setState }) => {
      setState(defaultForeplanActiveData);
    },
  },
  name: "ForeplanContext",
});

export const useForeplanActiveData = createHook(ForeplanActiveStore);

export const useForeplanActiveActions = createHook(ForeplanActiveStore, {
  selector: null,
});

export const useIsForeplanCourseChecked = createHook(ForeplanActiveStore, {
  selector: ({ foreplanCourses }, { code }: { code: string }) => {
    return !!foreplanCourses[code];
  },
});

export const useForeplanTotalCreditsTaken = createHook(ForeplanActiveStore, {
  selector: ({ totalCreditsTaken }) => {
    return totalCreditsTaken;
  },
});

export const useForeplanCoursesSize = createHook(ForeplanActiveStore, {
  selector: ({ foreplanCourses }) => {
    return size(foreplanCourses);
  },
});

export const useAnyForeplanCourses = createHook(ForeplanActiveStore, {
  selector: ({ foreplanCourses }) => {
    return size(foreplanCourses) > 0;
  },
});

export const useIsForeplanActive = createHook(ForeplanActiveStore, {
  selector: ({ active }) => {
    return active;
  },
});

export const useForeplanCourses = createHook(ForeplanActiveStore, {
  selector: ({ foreplanCourses }) => {
    return foreplanCourses;
  },
});

export const useIsPossibleToTakeForeplan = createHook(ForeplanActiveStore, {
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

export const useForeplanAdvice = createHook(ForeplanActiveStore, {
  selector: ({ advices, totalCreditsTaken }) => {
    return (
      advices.find(({ lowerBoundary, upperBoundary }) => {
        if (
          totalCreditsTaken >= lowerBoundary &&
          totalCreditsTaken <= upperBoundary
        ) {
          return true;
        }
        return false;
      }) ??
      (() => {
        console.warn("Advice not found for ", totalCreditsTaken);
        return advices[advices.length - 1];
      })()
    );
  },
});

export const useForeplanAdvices = createHook(ForeplanActiveStore, {
  selector: ({ advices }) => {
    return advices;
  },
});

export const ForeplanContextManager: FC = () => {
  const [state, { reset, disableForeplan }] = useForeplanActiveData();
  const [helperData] = useForeplanHelperData();
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

  useEffect(() => {
    console.log("futureCourseRequisites", helperData.futureCourseRequisites);
  }, [helperData.futureCourseRequisites]);

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
