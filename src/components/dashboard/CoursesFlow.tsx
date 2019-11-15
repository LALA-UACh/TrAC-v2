import { createContext, ReactNode, useCallback, useState } from "react";
import { useSetState } from "react-use";

import { ISemesterTaken } from "@interfaces";

export const CoursesFlowContext = createContext<{
  active?: string;
  flow?: Record<string, boolean>;
  requisites?: Record<string, boolean>;
  semestersTaken: ISemesterTaken[];
  explicitSemester?: string;
  checkExplicitSemester: (
    semestersTaken: { year: number; semester: string }[]
  ) => boolean;
  toggleExplicitSemester: (year: number, semester: string) => void;
  add: (data: {
    course: string;
    flow: string[];
    requisites: string[];
    semestersTaken: ISemesterTaken[];
  }) => void;
  remove: (course: string) => void;
}>({
  add: () => {},
  remove: () => {},
  checkExplicitSemester: () => false,
  toggleExplicitSemester: () => {},
  semestersTaken: []
});

export const CoursesFlow = ({ children }: { children: ReactNode }) => {
  const [explicitSemester, setExplicitSemester] = useState<
    string | undefined
  >();
  const checkExplicitSemester = useCallback(
    (semestersTaken: { year: number; semester: string }[]) => {
      return (
        !!explicitSemester &&
        !!semestersTaken.find(
          val => `${val.semester}${val.year}` === explicitSemester
        )
      );
    },
    [explicitSemester]
  );
  const toggleExplicitSemester = useCallback(
    (year: number, semester: string) => {
      setExplicitSemester(value => {
        const pair = `${semester}${year}`;
        if (value !== pair) return pair;
        return undefined;
      });
    },
    [setExplicitSemester]
  );

  // ONLY ACTIVE[0] IS SHOWN AS ACTIVE
  // AL THE REST WORKS AS HISTORY
  const [{ active, flow, requisites, semestersTaken }, setState] = useSetState<{
    active: string[];
    semestersTaken: ISemesterTaken[][];
    flow: Record<string, boolean>[];
    requisites: Record<string, boolean>[];
  }>({ active: [], flow: [], requisites: [], semestersTaken: [] });

  const add = useCallback(
    ({
      course,
      flow,
      requisites,
      semestersTaken
    }: {
      course: string;
      flow: string[];
      requisites: string[];
      semestersTaken: { year: number; semester: string }[];
    }) => {
      // ADD MEANS: THE NEW COURSE, FLOW AND REQUISITES HAVE TO BE PUT AT THE VERY BEGINNING
      setState(state => {
        state.active = [course, ...state.active];
        state.flow = [
          flow.reduce<Record<string, boolean>>(
            (ac, v) => ({ ...ac, [v]: true }),
            {}
          ),
          ...state.flow
        ];
        state.requisites = [
          requisites.reduce<Record<string, boolean>>(
            (ac, v) => ({ ...ac, [v]: true }),
            {}
          ),
          ...state.requisites
        ];
        state.semestersTaken = [semestersTaken, ...state.semestersTaken];

        if (!checkExplicitSemester(semestersTaken)) {
          setExplicitSemester(undefined);
        }

        return state;
      });
    },
    [setState, setExplicitSemester, explicitSemester, checkExplicitSemester]
  );
  const remove = useCallback(
    (course: string) => {
      // REMOVE MEANS: IF THE COURSE IS FOUND, REMOVE IT FROM THE ACTIVE ARRAY AND FOLLOWS IT'S INDEX TO REMOVE THE CORRESPONDING DATA FROM FLOWREF AND REQUISITESREF
      setState(state => {
        const indexToRemove = state.active.findIndex(
          activeCourse => activeCourse === course
        );
        if (indexToRemove !== -1) {
          state.active.splice(indexToRemove, 1);
          state.flow.splice(indexToRemove, 1);
          state.requisites.splice(indexToRemove, 1);
          state.semestersTaken.splice(indexToRemove, 1);
        }

        return state;
      });
    },
    [setState, setExplicitSemester, explicitSemester, checkExplicitSemester]
  );

  return (
    <CoursesFlowContext.Provider
      value={{
        active: active[0],
        flow: flow[0],
        requisites: requisites[0],
        semestersTaken: semestersTaken[0],
        add,
        remove,
        checkExplicitSemester,
        toggleExplicitSemester,
        explicitSemester
      }}
    >
      {children}
    </CoursesFlowContext.Provider>
  );
};
