import { differenceInWeeks } from "date-fns";
import { reduce, size, toInteger } from "lodash";
import { FC, useEffect } from "react";
import { createHook, createStore } from "react-sweet-state";
import { useDebounce, useUpdateEffect } from "react-use";

import { LAST_TIME_USED, StateCourse } from "../../../constants";
import { ICourse } from "../../../interfaces";
import { useUser } from "../../utils/useUser";

export type ICreditsNumber = { credits: number };

export interface IForeplanData {
  active: boolean;
  foreplanCourses: Record<string, Pick<ICourse, "name"> & ICreditsNumber>;
  totalCreditsTaken: number;
  advices: {
    lowerBoundary: number;
    upperBoundary: number;
    titleText: string;
    paragraphText: string;
    failRate: {
      low: number;
      mid: number;
      high: number;
    };
  }[];
}

const rememberForeplanDataKey = "TrAC_foreplan_remember_data";

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
  totalCreditsTaken: 0,
  advices: [],
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
    addCourseForeplan: (
      course: string,
      data: IForeplanData["foreplanCourses"][string]
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
    setForeplanAdvices: (advices: IForeplanData["advices"]) => ({
      setState,
    }) => {
      setState({
        advices,
      });
    },
    reset: () => ({ setState }) => {
      setState(defaultForeplanData);
    },
  },
  name: "ForeplanContext",
});

export const useForeplanData = createHook(ForeplanStore);

export const useForeplanActions = createHook(ForeplanStore, {
  selector: null,
});

export const useIsForeplanCourseChecked = createHook(ForeplanStore, {
  selector: ({ foreplanCourses }, { code }: { code: string }) => {
    return !!foreplanCourses[code];
  },
});

export const useForeplanTotalCreditsTaken = createHook(ForeplanStore, {
  selector: ({ totalCreditsTaken }) => {
    return totalCreditsTaken;
  },
});

export const useForeplanCoursesSize = createHook(ForeplanStore, {
  selector: ({ foreplanCourses }) => {
    return size(foreplanCourses);
  },
});

export const useAnyForeplanCourses = createHook(ForeplanStore, {
  selector: ({ foreplanCourses }) => {
    return size(foreplanCourses) > 0;
  },
});

export const useIsForeplanActive = createHook(ForeplanStore, {
  selector: ({ active }) => {
    return active;
  },
});

export const useForeplanCourses = createHook(ForeplanStore, {
  selector: ({ foreplanCourses }) => {
    return foreplanCourses;
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

export const useForeplanAdvice = createHook(ForeplanStore, {
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
      }) ?? advices[advices.length - 1]
    );
  },
});

export const ForeplanContextManager: FC<{ distinct?: string }> = ({
  distinct,
}) => {
  const [
    state,
    { reset, disableForeplan, setForeplanAdvices },
  ] = useForeplanData();

  const { user } = useUser({
    fetchPolicy: "cache-only",
  });

  useEffect(() => {
    //TODO: Use real data
    setForeplanAdvices([
      {
        lowerBoundary: 0,
        upperBoundary: 10,
        titleText: "¡Tu carga de estudio parece algo baja!",
        paragraphText:
          "Un <LowFailRate /> de estudiantes en años anteriores que han tomado una carga similar han pasado todos los cursos. Un <MidFailRate /> de ellos han reprobado 1 curso, y sólo <HighFailRate /> han reprobado más de uno.",
        failRate: {
          low: 85,
          mid: 10,
          high: 5,
        },
      },
      {
        lowerBoundary: 11,
        upperBoundary: 20,

        titleText: "¡Tu carga planeada parece moderada!",
        paragraphText:
          "Un <LowFailRate /> de estudiantes en años anteriores que han tomado una carga similar han pasado todos los cursos. Un <MidFailRate /> de ellos han reprobado 1 curso, y sólo <HighFailRate /> han reprobado más de uno.",
        failRate: {
          low: 55,
          mid: 30,
          high: 15,
        },
      },
      {
        lowerBoundary: 21,
        upperBoundary: 30,

        titleText: "¡Tu carga de estudio parece algo baja!",
        paragraphText:
          "Un <LowFailRate /> de estudiantes en años anteriores que han tomado una carga similar han pasado todos los cursos. Un <MidFailRate /> de ellos han reprobado 1 curso, y sólo <HighFailRate /> han reprobado más de uno.",
        failRate: {
          low: 5,
          mid: 20,
          high: 75,
        },
      },
    ]);
  }, [setForeplanAdvices]);

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
