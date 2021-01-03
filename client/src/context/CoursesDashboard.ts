import { assign, isEqual, throttle, uniq, uniqWith } from "lodash";
import { FC, memo, useEffect, useState } from "react";
import { createStore } from "react-state-selector";
import { useDebounce, usePreviousDistinct, useUpdateEffect } from "react-use";

import { ITakenSemester } from "../../../interfaces";
import { PERSISTENCE_VERSION_PREFIX } from "../../constants";
import {
  useGetPersistenceValueQuery,
  useSetPersistenceValueMutation,
} from "../graphql";
import { stringListToBooleanMap } from "../utils";
import { useDashboardInputState, useIsMockActive } from "./DashboardInput";
import { setIsDashboardLoading } from "./PersistenceLoading";
import { setTrackingData, track } from "./Tracking";

const emDash = "—";

export const pairTermYear = (term: string, year: number) => {
  return term + emDash + year;
};

export const checkExplicitSemesterCallback = (explicitSemester?: string) => (
  semestersTaken: ITakenSemester | ITakenSemester[]
): ITakenSemester | undefined => {
  if (explicitSemester) {
    if (Array.isArray(semestersTaken)) {
      return semestersTaken.find(
        (v) => pairTermYear(v.term, v.year) === explicitSemester
      );
    }
    return pairTermYear(semestersTaken.term, semestersTaken.year) ===
      explicitSemester
      ? semestersTaken
      : undefined;
  }
  return undefined;
};

const uniqWithEqual = <A>(a: A[]) => {
  return uniqWith(a, isEqual);
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

export const toggleOpenCourse = throttle(
  (code: string, callback: (wasOpen: boolean) => void) => {
    const { coursesOpen } = CoursesDashboardStore.actions.toggleOpenCourse(
      code
    );

    callback(!coursesOpen[code]);
  },
  300,
  {
    leading: true,
    trailing: false,
  }
);

export const CoursesDashboardStore = createStore(defaultCourseDashboardData, {
  devName: "CoursesDashboard",
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
    }) => (draft) => {
      const activeHistory = uniq([course, ...draft.activeHistory]);
      const flowHistory = uniqWithEqual([
        stringListToBooleanMap(flow),
        ...draft.flowHistory,
      ]);
      const requisitesHistory = uniqWithEqual([
        stringListToBooleanMap(requisites),
        ...draft.requisitesHistory,
      ]);

      assign(draft, {
        activeHistory,
        flowHistory,
        requisitesHistory,
        semestersTakenHistory: uniq([
          semestersTaken,
          ...draft.semestersTakenHistory,
        ]),
        activeCourse: activeHistory[0],
        flow: flowHistory[0],
        requisites: requisitesHistory[0],
        semestersTaken,
        explicitSemester:
          semestersTaken &&
          checkExplicitSemesterCallback(draft.explicitSemester)(semestersTaken)
            ? draft.explicitSemester
            : undefined,
      });
    },
    removeCourse: (course: string) => (draft) => {
      const indexToRemove = draft.activeHistory.findIndex(
        (activeCourse) => activeCourse === course
      );

      if (indexToRemove !== -1) {
        draft.activeHistory.splice(indexToRemove, 1);

        draft.flowHistory.splice(indexToRemove, 1);

        draft.requisitesHistory.splice(indexToRemove, 1);

        draft.semestersTakenHistory.splice(indexToRemove, 1);

        draft.activeCourse = draft.activeHistory[0];

        draft.flow = draft.flowHistory[0];

        draft.requisites = draft.requisitesHistory[0];

        draft.semestersTaken = draft.semestersTakenHistory[0];
      }
    },
    toggleExplicitSemester: ({ term, year }: ITakenSemester) => (draft) => {
      const pair = pairTermYear(term, year);
      draft.explicitSemester =
        draft.explicitSemester === pair ? undefined : pair;
    },
    toggleOpenCourse: (course: string) => (draft) => {
      if (course in draft.coursesOpen) {
        delete draft.coursesOpen[course];
      } else {
        draft.coursesOpen[course] = true;
      }
    },
    reset: (data: ICoursesDashboardData = defaultCourseDashboardData) => (
      draft
    ) => assign(draft, data),
  },
  hooks: {
    useActiveCourse: ({ activeCourse }, code: string) => {
      return activeCourse === code;
    },
    useActiveRequisites: ({ requisites }, code: string) => {
      return requisites?.[code];
    },
    useActiveFlow: ({ flow }, code: string) => {
      return flow?.[code];
    },
    useActiveSemestersTaken: ({ semestersTaken }) => {
      return semestersTaken;
    },
    useExplicitSemester: ({ explicitSemester }) => {
      return explicitSemester;
    },
    useCheckExplicitSemester: (
      { explicitSemester },
      semestersTaken?: ITakenSemester[] | ITakenSemester
    ) => {
      if (!semestersTaken) return undefined;

      const pair = checkExplicitSemesterCallback(explicitSemester)(
        semestersTaken
      );
      return pair ? pairTermYear(pair.term, pair.year) : pair;
    },
    useDashboardIsCourseOpen: ({ coursesOpen }, code: string) => {
      return !!coursesOpen[code];
    },
    useDashboardCoursesOpen: ({ coursesOpen }) => {
      return coursesOpen;
    },
  },
});

const rememberCourseDashboardDataKey =
  PERSISTENCE_VERSION_PREFIX + "course_dashboard_data";

export const CoursesDashbordManager: FC<{ distinct?: string }> = memo(
  ({ distinct }) => {
    const mock = useIsMockActive();
    const {
      program,
      student,

      chosenCurriculum,
    } = useDashboardInputState();

    const state = CoursesDashboardStore.useStore();

    const [key, setKey] = useState(
      rememberCourseDashboardDataKey +
        `${chosenCurriculum || ""}${program || ""}${student || ""}${
          mock ? 1 : 0
        }`
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

    const {
      data: dataRememberDashboard,
      loading: loadingDataRememberDashboard,
    } = useGetPersistenceValueQuery({
      variables: {
        key,
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "network-only",
    });

    useEffect(() => {
      setIsDashboardLoading(loadingDataRememberDashboard);
    }, [loadingDataRememberDashboard]);

    useEffect(() => {
      if (!loadingDataRememberDashboard) {
        if (dataRememberDashboard?.getPersistenceValue) {
          CoursesDashboardStore.actions.reset({
            ...defaultCourseDashboardData,
            ...dataRememberDashboard.getPersistenceValue.data,
          });
        } else {
          CoursesDashboardStore.actions.reset();
        }
      }
    }, [dataRememberDashboard, loadingDataRememberDashboard]);

    const [setRememberDashboard] = useSetPersistenceValueMutation({
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

    const previousExplicitSemester = usePreviousDistinct(
      state.explicitSemester
    );

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
      CoursesDashboardStore.actions.reset();
    }, [distinct]);

    useEffect(() => {
      setTrackingData({
        coursesOpen: state.activeHistory.join("|"),
      });
    }, [state.activeHistory, setTrackingData]);

    return null;
  }
);
