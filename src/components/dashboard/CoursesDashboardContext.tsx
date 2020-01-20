import React, {
  createContext,
  Dispatch,
  FC,
  Reducer,
  ReducerState,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { useDebounce, usePreviousDistinct, useUpdateEffect } from "react-use";

import { Action, ITakenSemester } from "../../../interfaces";
import { stringListToBooleanMap } from "../../utils";
import { TrackingContext } from "../Tracking";

const emDash = "—";

const pairTermYear = (term: string, year: number) => {
  return term + emDash + year;
};

export type ICoursesDashboardActions =
  | Action<
      "addCourse",
      {
        course: string;
        flow: string[];
        requisites: string[];
        semestersTaken?: { year: number; term: string }[];
      }
    >
  | Action<"removeCourse", string>
  | Action<"toggleExplicitSemester", { year: number; term: string }>
  | Action<"reset">;

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

const rememberCourseDashboardDataKey = "TrAC_dashboard_data";

const initCourseDashboardData = (
  initialData = defaultCourseDashboardData
): ReducerState<typeof courseDashboardReducer> => {
  try {
    const rememberedData = localStorage.getItem(rememberCourseDashboardDataKey);
    if (!rememberedData) return initialData;
    return { ...initialData, ...JSON.parse(rememberedData) };
  } catch (err) {
    return initialData;
  }
};

const courseDashboardReducer: Reducer<
  ICoursesDashboardData,
  ICoursesDashboardActions
> = (state, action) => {
  switch (action.type) {
    case "addCourse": {
      const flowHistory = [
        stringListToBooleanMap(action.payload.flow),
        ...state.flowHistory,
      ];
      const requisitesHistory = [
        stringListToBooleanMap(action.payload.requisites),
        ...state.requisitesHistory,
      ];
      return {
        ...state,
        activeHistory: [action.payload.course, ...state.activeHistory],
        flowHistory,
        requisitesHistory,
        semestersTakenHistory: [
          action.payload.semestersTaken,
          ...state.semestersTakenHistory,
        ],
        activeCourse: action.payload.course,
        flow: flowHistory[0],
        requisites: requisitesHistory[0],
        semestersTaken: action.payload.semestersTaken,
        explicitSemester:
          action.payload.semestersTaken &&
          checkExplicitSemesterCallback(state.explicitSemester)(
            action.payload.semestersTaken
          )
            ? state.explicitSemester
            : undefined,
      };
    }
    case "removeCourse": {
      const indexToRemove = state.activeHistory.findIndex(
        activeCourse => activeCourse === action.payload
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

        return {
          ...state,
          activeHistory: stateActiveHistory,
          flowHistory: stateFlowHistory,
          requisitesHistory: stateRequisitesHistory,
          semestersTakenHistory: stateSemestersTakenHistory,
          activeCourse: stateActiveHistory[0],
          flow: stateFlowHistory[0],
          requisites: stateRequisitesHistory[0],
          semestersTaken: stateSemestersTakenHistory[0],
        };
      }
      return state;
    }
    case "toggleExplicitSemester": {
      const pair = pairTermYear(action.payload.term, action.payload.year);
      return {
        ...state,
        explicitSemester: state.explicitSemester === pair ? undefined : pair,
      };
    }
    case "reset": {
      return defaultCourseDashboardData;
    }
    default: {
      console.error("CourseDashboard action not handled!", action);
    }
  }

  return state;
};

export const CoursesDashboardContext = createContext<
  ICoursesDashboardData & {
    dispatch: Dispatch<ICoursesDashboardActions>;
    checkExplicitSemester: (
      semestersTaken: ITakenSemester[] | ITakenSemester
    ) => ITakenSemester | undefined;
  }
>({
  ...defaultCourseDashboardData,
  dispatch: () => {},
  checkExplicitSemester: () => undefined,
});

export const CoursesDashboard: FC<{
  program?: string;
  curriculum?: string;
  mock: boolean;
}> = ({ children, program, curriculum, mock }) => {
  const Tracking = useContext(TrackingContext);

  const [state, dispatch] = useReducer(
    courseDashboardReducer,
    defaultCourseDashboardData,
    initCourseDashboardData
  );

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
      Tracking.current.track({
        action: "click",
        target: `semester-box-${year}-${term}`,
        effect: "load-semester",
      });
    } else if (previousTerm && previousYear) {
      Tracking.current.track({
        action: "click",
        target: `semester-box-${previousYear}-${previousTerm}`,
        effect: "unload-semester",
      });
    }
  }, [state.explicitSemester, previousExplicitSemester]);

  useUpdateEffect(() => {
    dispatch({ type: "reset" });
  }, [curriculum, program, mock, dispatch]);

  useEffect(() => {
    Tracking.current.coursesOpen = state.activeHistory.join("|");
  }, [state.activeHistory]);

  const checkExplicitSemester = useCallback(
    checkExplicitSemesterCallback(state.explicitSemester),
    [state.explicitSemester]
  );

  return (
    <CoursesDashboardContext.Provider
      value={{
        ...state,
        dispatch,
        checkExplicitSemester,
      }}
    >
      {children}
    </CoursesDashboardContext.Provider>
  );
};
