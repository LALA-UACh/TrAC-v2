import { isEqual, uniqWith } from "lodash";
import { FC, useEffect, useState } from "react";
import { createHook, createStore } from "react-sweet-state";
import { useDebounce, usePreviousDistinct, useUpdateEffect } from "react-use";

import { useMutation, useQuery } from "@apollo/react-hooks";

import { ITakenSemester } from "../../interfaces";
import {
  GET_PERSISTENCE_VALUE,
  SET_PERSISTENCE_VALUE,
} from "../graphql/queries";
import { useDashboardInputState } from "../pages";
import { stringListToBooleanMap } from "../utils";
import { useIsPersistenceLoading } from "../utils/usePersistenceLoading";
import { useTracking } from "./Tracking";

const emDash = "—";

export const pairTermYear = (term: string, year: number) => {
  return term + emDash + year;
};

export interface ICoursesDashboardData {
  activeCourse: string | undefined;
  activeHistory: readonly string[];
  flow: Record<string, boolean>;
  flowHistory: readonly Record<string, boolean>[];
  requisites: Record<string, boolean>;
  requisitesHistory: readonly Record<string, boolean>[];
  semestersTaken: readonly ITakenSemester[] | undefined;
  semestersTakenHistory: readonly (ITakenSemester[] | undefined)[];
  explicitSemester: string | undefined;
  coursesOpen: Record<string, boolean>;
}

const emptyArray = Object.freeze([]);
const emptyObject = Object.freeze({});

const defaultCourseDashboardData: ICoursesDashboardData = Object.freeze({
  activeCourse: undefined,
  semestersTaken: emptyArray,
  semestersTakenHistory: emptyArray,
  activeHistory: emptyArray,
  flowHistory: emptyArray,
  requisitesHistory: emptyArray,
  coursesOpen: emptyObject,
  flow: emptyObject,
  requisites: emptyObject,
  explicitSemester: undefined,
});

const checkExplicitSemesterCallback = (explicitSemester?: string) => (
  semestersTaken: ITakenSemester | ITakenSemester[]
): ITakenSemester | undefined => {
  if (explicitSemester) {
    if (Array.isArray(semestersTaken)) {
      return semestersTaken.find(
        v => pairTermYear(v.term, v.year) === explicitSemester
      );
    }
    return pairTermYear(semestersTaken.term, semestersTaken.year) ===
      explicitSemester
      ? semestersTaken
      : undefined;
  }
  return undefined;
};

const rememberCourseDashboardDataKey = "TrAC_course_dashboard_data";

const initCourseDashboardData = (
  initialData = defaultCourseDashboardData
): ICoursesDashboardData => {
  return initialData;
};

const uniqWithEqual = <A>(a: A[]) => {
  return uniqWith(a, isEqual);
};

const CoursesDashboardStore = createStore({
  initialState: initCourseDashboardData(),
  actions: {
    addCourse: ({
      course,
      flow,
      requisites,
      semestersTaken,
    }: {
      course: string;
      flow: string[];
      requisites: string[];
      semestersTaken?: { year: number; term: string }[];
    }) => ({ setState, getState }) => {
      const state = getState();

      const activeHistory = uniqWithEqual([course, ...state.activeHistory]);
      const flowHistory = uniqWithEqual([
        stringListToBooleanMap(flow),
        ...state.flowHistory,
      ]);
      const requisitesHistory = uniqWithEqual([
        stringListToBooleanMap(requisites),
        ...state.requisitesHistory,
      ]);

      setState({
        activeHistory,
        flowHistory,
        requisitesHistory,
        semestersTakenHistory: [semestersTaken, ...state.semestersTakenHistory],
        activeCourse: activeHistory[0],
        flow: flowHistory[0],
        requisites: requisitesHistory[0],
        semestersTaken: semestersTaken,
        explicitSemester:
          semestersTaken &&
          checkExplicitSemesterCallback(state.explicitSemester)(semestersTaken)
            ? state.explicitSemester
            : undefined,
      });
    },
    removeCourse: (course: string) => ({ setState, getState }) => {
      const state = getState();
      const indexToRemove = state.activeHistory.findIndex(
        activeCourse => activeCourse === course
      );
      if (indexToRemove !== -1) {
        const stateActiveHistory = state.activeHistory.slice(0);
        stateActiveHistory.splice(indexToRemove, 1);

        const stateFlowHistory = state.flowHistory.slice(0);
        stateFlowHistory.splice(indexToRemove, 1);

        const stateRequisitesHistory = state.requisitesHistory.slice(0);
        stateRequisitesHistory.splice(indexToRemove, 1);

        const stateSemestersTakenHistory = state.semestersTakenHistory.slice(0);
        stateSemestersTakenHistory.splice(indexToRemove, 1);

        setState({
          activeHistory: stateActiveHistory,
          flowHistory: stateFlowHistory,
          requisitesHistory: stateRequisitesHistory,
          semestersTakenHistory: stateSemestersTakenHistory,
          activeCourse: stateActiveHistory[0],
          flow: stateFlowHistory[0],
          requisites: stateRequisitesHistory[0],
          semestersTaken: stateSemestersTakenHistory[0],
        });
      } else {
      }
    },
    toggleExplicitSemester: ({ term, year }: ITakenSemester) => ({
      setState,
      getState,
    }) => {
      const pair = pairTermYear(term, year);
      setState({
        explicitSemester:
          getState().explicitSemester === pair ? undefined : pair,
      });
    },
    reset: (data: ICoursesDashboardData = defaultCourseDashboardData) => ({
      setState,
    }) => {
      setState({ ...data });
    },
    checkExplicitSemester: (
      semestersTaken: ITakenSemester | ITakenSemester[]
    ) => ({ getState }) => {
      const explicitSemester = getState().explicitSemester;

      return checkExplicitSemesterCallback(explicitSemester)(semestersTaken);
    },
    toggleOpenCourse: (course: string) => ({ setState, getState }) => {
      const coursesOpen = { ...getState().coursesOpen };
      if (coursesOpen[course]) {
        delete coursesOpen[course];
      } else {
        coursesOpen[course] = true;
      }
      setState({
        coursesOpen,
      });
    },
  },
});

const useCoursesDashboardData = createHook(CoursesDashboardStore);

export const useActiveCourse = createHook(CoursesDashboardStore, {
  selector: ({ activeCourse }, { code }: { code: string }) => {
    return activeCourse === code;
  },
});
export const useActiveRequisites = createHook(CoursesDashboardStore, {
  selector: ({ requisites }, { code }: { code: string }) => {
    return requisites?.[code];
  },
});
export const useActiveFlow = createHook(CoursesDashboardStore, {
  selector: ({ flow }, { code }: { code: string }) => {
    return flow?.[code];
  },
});
export const useActiveSemestersTaken = createHook(CoursesDashboardStore, {
  selector: ({ semestersTaken }) => {
    return semestersTaken;
  },
});
export const useExplicitSemester = createHook(CoursesDashboardStore, {
  selector: ({ explicitSemester }) => {
    return explicitSemester;
  },
});
export const useCheckExplicitSemester = createHook(CoursesDashboardStore, {
  selector: (
    { explicitSemester },
    { semestersTaken }: { semestersTaken: ITakenSemester[] | ITakenSemester }
  ) => {
    const pair = checkExplicitSemesterCallback(explicitSemester)(
      semestersTaken
    );
    return pair ? pairTermYear(pair.term, pair.year) : pair;
  },
});
export const useDashboardIsCourseOpen = createHook(CoursesDashboardStore, {
  selector: ({ coursesOpen }, { code }: { code: string }) => {
    return !!coursesOpen[code];
  },
});
export const useDashboardCoursesActions = createHook(CoursesDashboardStore, {
  selector: null,
});

export const CoursesDashbordManager: FC<{ distinct?: string }> = ({
  distinct,
}) => {
  const { program, student, mock, chosenCurriculum } = useDashboardInputState();

  const [, { track, setTrackingData }] = useTracking();

  const [state, { reset }] = useCoursesDashboardData();

  const [key, setKey] = useState(
    rememberCourseDashboardDataKey +
      `${chosenCurriculum || ""}${program || ""}${student || ""}${mock ? 1 : 0}`
  );

  useDebounce(
    () => {
      setKey(
        rememberCourseDashboardDataKey +
          `${chosenCurriculum || ""}${program || ""}${student || ""}${
            mock ? 1 : 0
          }`
      );
    },
    500,
    [chosenCurriculum, program, student, mock, setKey]
  );

  const { setIsDashboardLoading } = useIsPersistenceLoading();

  const {
    data: dataRememberDashboard,
    loading: loadingDataRememberDashboard,
  } = useQuery(GET_PERSISTENCE_VALUE, {
    variables: {
      key,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    setIsDashboardLoading(loadingDataRememberDashboard);
  }, [loadingDataRememberDashboard, setIsDashboardLoading]);

  useEffect(() => {
    if (!loadingDataRememberDashboard) {
      if (dataRememberDashboard?.getPersistenceValue) {
        reset({
          ...defaultCourseDashboardData,
          ...dataRememberDashboard.getPersistenceValue.data,
        });
      } else {
        reset();
      }
    }
  }, [dataRememberDashboard, loadingDataRememberDashboard, reset]);

  const [setRememberDashboard] = useMutation(SET_PERSISTENCE_VALUE, {
    ignoreResults: true,
  });

  useDebounce(
    () => {
      if (!loadingDataRememberDashboard) {
        setRememberDashboard({
          variables: {
            key,
            data: state,
          },
        });
      }
    },
    1000,
    [key, state, setRememberDashboard, loadingDataRememberDashboard]
  );

  const previousExplicitSemester = usePreviousDistinct(state.explicitSemester);

  useUpdateEffect(() => {
    const [term, year] = state.explicitSemester?.split(emDash) ?? [];
    const [previousTerm, previousYear] =
      previousExplicitSemester?.split(emDash) ?? [];

    if (year && term) {
      track({
        action: "click",
        target: `semester-box-${year}-${term}`,
        effect: "load-semester",
      });
    } else if (previousTerm && previousYear) {
      track({
        action: "click",
        target: `semester-box-${previousYear}-${previousTerm}`,
        effect: "unload-semester",
      });
    }
  }, [state.explicitSemester, previousExplicitSemester]);

  useUpdateEffect(() => {
    reset();
  }, [distinct, reset]);

  useEffect(() => {
    setTrackingData({
      coursesOpen: state.activeHistory.join("|"),
    });
  }, [state.activeHistory, setTrackingData]);

  return null;
};
