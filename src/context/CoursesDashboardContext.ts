import { FC, useEffect } from "react";
import { createHook, createStore } from "react-sweet-state";
import { useDebounce, usePreviousDistinct, useUpdateEffect } from "react-use";

import { ITakenSemester } from "../../interfaces";
import { stringListToBooleanMap } from "../utils";
import { useTracking } from "./Tracking";

const emDash = "—";

export const pairTermYear = (term: string, year: number) => {
  return term + emDash + year;
};

export interface ICoursesDashboardData {
  activeCourse?: string;
  activeHistory: string[];
  flow?: Record<string, boolean>;
  flowHistory: Record<string, boolean>[];
  requisites?: Record<string, boolean>;
  requisitesHistory: Record<string, boolean>[];
  semestersTaken: ITakenSemester[] | undefined;
  semestersTakenHistory: (ITakenSemester[] | undefined)[];
  explicitSemester?: string;
}

const defaultCourseDashboardData: ICoursesDashboardData = {
  semestersTaken: [],
  semestersTakenHistory: [],
  activeHistory: [],
  flowHistory: [],
  requisitesHistory: [],
};

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
  try {
    const rememberedData = localStorage.getItem(rememberCourseDashboardDataKey);
    if (!rememberedData) return initialData;
    return { ...initialData, ...JSON.parse(rememberedData) };
  } catch (err) {
    return initialData;
  }
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

      const flowHistory = [stringListToBooleanMap(flow), ...state.flowHistory];
      const requisitesHistory = [
        stringListToBooleanMap(requisites),
        ...state.requisitesHistory,
      ];

      setState({
        activeHistory: [course, ...state.activeHistory],
        flowHistory,
        requisitesHistory,
        semestersTakenHistory: [semestersTaken, ...state.semestersTakenHistory],
        activeCourse: course,
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
    reset: () => ({ setState }) => {
      setState(defaultCourseDashboardData);
    },
    checkExplicitSemester: (
      semestersTaken: ITakenSemester | ITakenSemester[]
    ) => ({ getState }) => {
      const explicitSemester = getState().explicitSemester;

      return checkExplicitSemesterCallback(explicitSemester)(semestersTaken);
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
export const useDashboardCoursesActions = createHook(CoursesDashboardStore, {
  selector: null,
});

export const CoursesDashbordManager: FC<{ distinct?: string }> = ({
  distinct,
}) => {
  const [, { track, setTrackingData }] = useTracking();

  const [state, { reset }] = useCoursesDashboardData();

  useDebounce(
    () => {
      try {
        localStorage.setItem(
          rememberCourseDashboardDataKey,
          JSON.stringify(state)
        );
      } catch (err) {}
    },
    3000,
    [state]
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
