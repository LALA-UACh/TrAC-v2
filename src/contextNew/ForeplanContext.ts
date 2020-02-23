import { createStore } from "react-state-selector";

import { PerformanceByLoad } from "../../typings/graphql";
import { stringListToBooleanMap } from "../utils";

const emptyObject = Object.freeze({});
const emptyArray = Object.freeze([]) as [];

interface IForeplanHelperData {
  courseDirectTake: Record<string, boolean | undefined>;
  courseFailRate: Record<string, number>;
  courseEffort: Record<string, number>;
  advices: PerformanceByLoad[];
}

const defaultForeplanHelperStore: IForeplanHelperData = Object.freeze({
  courseDirectTake: emptyObject,
  courseFailRate: emptyObject,
  courseEffort: emptyObject,
  advices: emptyArray,
});

export const ForeplanHelperStore = createStore(defaultForeplanHelperStore, {
  hooks: {
    useForeplanIsDirectTake: (
      { courseDirectTake },
      { code }: { code: string }
    ) => {
      return (
        courseDirectTake[code] ||
        (courseDirectTake === emptyObject ? undefined : false)
      );
    },
    useForeplanCourseFailRate: (
      { courseFailRate },
      { code }: { code: string }
    ) => {
      return courseFailRate[code] || 0;
    },
    useForeplanCourseEffort: ({ courseEffort }, { code }: { code: string }) => {
      return courseEffort[code] || 1;
    },
    useForeplanAdvice: (
      { advices },
      { totalCreditsTaken }: { totalCreditsTaken: number }
    ) => {
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
    useForeplanAdvices: ({ advices }) => advices,
  },
  actions: {
    setDirectTakeData: (data: string[]) => draft => {
      draft.courseDirectTake = stringListToBooleanMap(data);
    },
    setFailRateData: (data: { code: string; failRate: number }[]) => draft => {
      draft.courseFailRate = data.reduce<Record<string, number>>(
        (acum, { code, failRate }) => {
          acum[code] = failRate;
          return acum;
        },
        {}
      );
    },
    setEffortData: (data: { code: string; effort: number }[]) => draft => {
      draft.courseEffort = data.reduce<Record<string, number>>(
        (acum, { code, effort }) => {
          acum[code] = effort;
          return acum;
        },
        {}
      );
    },
    setForeplanAdvices: (advices: IForeplanHelperData["advices"]) => draft => {
      draft.advices = advices;
    },
  },
});
