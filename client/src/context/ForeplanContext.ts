import { assign, reduce, size } from "lodash";
import { FC, memo, useEffect, useState } from "react";
import { createSelector, createStore } from "react-state-selector";
import { useDebounce } from "react-use";

import { PERSISTENCE_VERSION_PREFIX, StateCourse } from "../../constants";
import {
  PerformanceByLoad,
  useGetPersistenceValueQuery,
  useSetPersistenceValueMutation,
} from "../graphql";
import { stringListToBooleanMap } from "../utils";
import { useUser } from "../utils/useUser";
import { useDashboardInputState } from "./DashboardInput";
import { setIsForeplanLoading } from "./PersistenceLoading";
import { setTrackingData } from "./Tracking";

import type { ICourse } from "../../../interfaces";

const emptyObject = Object.freeze({});
const emptyArray = Object.freeze([]) as [];

interface IForeplanHelperData {
  courseDirectTake: Record<string, boolean | undefined>;
  courseFailRate: Record<string, number>;
  courseEffort: Record<string, number>;
  advices: PerformanceByLoad[];
  indirectTakeCourses: {
    [indirectTakeCourse: string]: string[];
  };
}

const defaultForeplanHelperStore: IForeplanHelperData = Object.freeze({
  courseDirectTake: emptyObject,
  courseFailRate: emptyObject,
  courseEffort: emptyObject,
  advices: emptyArray,
  indirectTakeCourses: emptyObject,
});

export const ForeplanHelperStore = createStore(defaultForeplanHelperStore, {
  devName: "ForeplanHelper",
  hooks: {
    useForeplanIsDirectTake: ({ courseDirectTake }, code: string) => {
      return (
        courseDirectTake[code] ||
        (courseDirectTake === emptyObject ? undefined : false)
      );
    },
    useForeplanCourseFailRate: ({ courseFailRate }, code: string) => {
      return courseFailRate[code] || 0;
    },
    useForeplanCourseEffort: ({ courseEffort }, code: string) => {
      return courseEffort[code] || 1;
    },
    useForeplanAdvice: ({ advices }, totalCreditsTaken: number) => {
      return (
        advices.find(({ lowerBoundary, upperBoundary, isStudentCluster }) => {
          if (
            isStudentCluster &&
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
    useForeplanAdvices: ({ advices }) => advices,
  },
  actions: {
    setDirectTakeData: (data: string[]) => (draft) => {
      draft.courseDirectTake = stringListToBooleanMap(data);
    },
    setFailRateData: (data: { code: string; failRate: number }[]) => (
      draft
    ) => {
      draft.courseFailRate = data.reduce<Record<string, number>>(
        (acum, { code, failRate }) => {
          acum[code] = failRate;
          return acum;
        },
        {}
      );
    },
    setEffortData: (data: { code: string; effort: number }[]) => (draft) => {
      draft.courseEffort = data.reduce<Record<string, number>>(
        (acum, { code, effort }) => {
          acum[code] = effort;
          return acum;
        },
        {}
      );
    },
    setForeplanAdvices: (advices: IForeplanHelperData["advices"]) => (
      draft
    ) => {
      draft.advices = advices;
    },
    setIndirectTakeCoursesRequisites: (
      indirectTakeCourses: { course: string; requisitesUnmet: string[] }[]
    ) => (draft) => {
      draft.indirectTakeCourses = indirectTakeCourses.reduce<
        IForeplanHelperData["indirectTakeCourses"]
      >((acum, { course, requisitesUnmet }) => {
        acum[course] = requisitesUnmet;
        return acum;
      }, {});
    },
  },
});

export type ICreditsNumber = { credits: number };

export interface IForeplanActiveData {
  active: boolean;
  foreplanCourses: Record<string, Pick<ICourse, "name"> & ICreditsNumber>;
  currentCoursesPrediction: Record<string, StateCourse | undefined>;
  totalCreditsTaken: number;
}

const defaultForeplanActiveData: IForeplanActiveData = Object.freeze({
  active: false,
  foreplanCourses: emptyObject,
  totalCreditsTaken: 0,
  currentCoursesPrediction: emptyObject,
});

export const ForeplanActiveStore = createStore(defaultForeplanActiveData, {
  devName: "ForeplanActive",
  actions: {
    activateForeplan: () => (draft) => {
      draft.active = true;
    },
    disableForeplan: () => (draft) => {
      draft.active = false;
    },
    addCourseForeplan: (
      course: string,
      data: IForeplanActiveData["foreplanCourses"][string]
    ) => (draft) => {
      draft.foreplanCourses[course] = data;

      draft.totalCreditsTaken = reduce(
        draft.foreplanCourses,
        (acum, { credits }) => {
          return acum + credits;
        },
        0
      );
    },
    removeCourseForeplan: (course: string) => (draft) => {
      delete draft.foreplanCourses[course];

      draft.totalCreditsTaken = reduce(
        draft.foreplanCourses,
        (acum, { credits }) => {
          return acum + credits;
        },
        0
      );
    },
    setCoursePrediction: (
      { code }: Pick<ICourse, "code">,
      state: StateCourse
    ) => (draft) => {
      draft.currentCoursesPrediction[code] = state;
    },
    reset: (data: IForeplanActiveData = defaultForeplanActiveData) => (draft) =>
      assign(draft, data),
  },
  hooks: {
    useIsForeplanCourseChecked: ({ foreplanCourses }, code: string) => {
      return !!foreplanCourses[code];
    },
    useForeplanTotalCreditsTaken: ({ totalCreditsTaken }) => {
      return totalCreditsTaken;
    },
    useForeplanCoursesSize: ({ foreplanCourses }) => {
      return size(foreplanCourses);
    },
    useAnyForeplanCourses: ({ foreplanCourses }) => {
      return size(foreplanCourses) > 0;
    },
    useIsForeplanActive: ({ active }) => {
      return active;
    },
    useForeplanCourses: ({ foreplanCourses }) => {
      return foreplanCourses;
    },
    useIsPossibleToTakeForeplan: (
      { active, currentCoursesPrediction },
      { state, course }: { state: StateCourse | undefined; course: string }
    ) => {
      if (active) {
        const prediction = currentCoursesPrediction[course];

        switch (prediction || state) {
          case undefined:
          case StateCourse.Failed:
          case StateCourse.Canceled: {
            return true;
          }
        }
      }
      return false;
    },
    usePredictionState: ({ currentCoursesPrediction }, course: string) => {
      return currentCoursesPrediction[course];
    },
    useForeplanIsFutureCourseRequisitesFulfilled: (
      { foreplanCourses, currentCoursesPrediction },
      code: string
    ) => {
      const indirectTakeCourseRequisites = ForeplanHelperStore.produce()
        .indirectTakeCourses[code];
      if (!indirectTakeCourseRequisites) return false;

      return indirectTakeCourseRequisites.every((requisiteUnmet) => {
        return (
          requisiteUnmet in foreplanCourses ||
          currentCoursesPrediction[requisiteUnmet] === StateCourse.Passed
        );
      });
    },
    useIsDirectTakePredicted: createSelector(
      ({ currentCoursesPrediction }: IForeplanActiveData, _code: string) =>
        currentCoursesPrediction,
      (_, code) => code,
      (currentCoursesPrediction, code: string) => {
        const requisitesUnmet = ForeplanHelperStore.produce()
          .indirectTakeCourses[code];
        if (!requisitesUnmet) return false;

        return requisitesUnmet.every((requisiteUnmet) => {
          const prediction = currentCoursesPrediction[requisiteUnmet];
          return prediction === StateCourse.Passed;
        });
      }
    ),
  },
});

const rememberForeplanDataKey = PERSISTENCE_VERSION_PREFIX + "foreplan_data";

export const ForeplanContextManager: FC = memo(() => {
  const { program, student, mock, chosenCurriculum } = useDashboardInputState();

  const state = ForeplanActiveStore.useStore();

  const { user } = useUser({
    fetchPolicy: "cache-only",
  });

  const [setRememberForeplan] = useSetPersistenceValueMutation({
    ignoreResults: true,
  });

  const [key, setKey] = useState(
    rememberForeplanDataKey +
      `${chosenCurriculum || ""}${program || ""}${student || ""}${mock ? 1 : 0}`
  );

  useDebounce(
    () => {
      setKey(
        rememberForeplanDataKey +
          `${chosenCurriculum || ""}${program || ""}${student || ""}${
            mock ? 1 : 0
          }`
      );
    },
    500,
    [chosenCurriculum, program, student, mock, setKey]
  );

  const {
    data: dataRememberForeplan,
    loading: loadingRememberForeplan,
  } = useGetPersistenceValueQuery({
    variables: {
      key,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    setIsForeplanLoading(loadingRememberForeplan);
  }, [loadingRememberForeplan]);

  useEffect(() => {
    if (!loadingRememberForeplan) {
      if (dataRememberForeplan?.getPersistenceValue) {
        ForeplanActiveStore.actions.reset({
          ...defaultForeplanActiveData,
          ...dataRememberForeplan.getPersistenceValue.data,
        });
      }
    } else {
      ForeplanActiveStore.actions.reset();
    }
  }, [dataRememberForeplan, loadingRememberForeplan]);

  useEffect(() => {
    if (!loadingRememberForeplan) {
      const coursesArray = Object.keys(state.foreplanCourses);
      setTrackingData({
        foreplanActive: state.active,
        foreplanCredits: state.active ? state.totalCreditsTaken : undefined,
        foreplanCourses:
          coursesArray.length > 0 ? coursesArray.join("|") : undefined,
      });
    }
  }, [state, setTrackingData, loadingRememberForeplan]);

  useEffect(() => {
    if (state.active && !user?.config.FOREPLAN) {
      ForeplanActiveStore.actions.disableForeplan();
    }
  }, [user, state.active]);

  useDebounce(
    () => {
      if (user?.config.FOREPLAN) {
        setRememberForeplan({
          variables: {
            key,
            data: state,
          },
        });
      }
    },
    1000,
    [key, state, user, setRememberForeplan]
  );

  return null;
});
