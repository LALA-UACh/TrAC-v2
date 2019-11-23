import {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { TrackingContext } from "@components/Tracking";
import { ISemesterTaken } from "@interfaces";

export const CoursesFlowContext = createContext<{
  active?: string;
  flow?: Record<string, boolean>;
  requisites?: Record<string, boolean>;
  semestersTaken: ISemesterTaken[];
  explicitSemester?: string;
  checkExplicitSemester: (
    semestersTaken:
      | { year: number; semester: string }[]
      | { year: number; semester: string }
  ) => { year: number; semester: string } | undefined;
  toggleExplicitSemester: (year: number, semester: string) => boolean;
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
  checkExplicitSemester: () => undefined,
  toggleExplicitSemester: () => false,
  semestersTaken: [],
});

export const CoursesFlow: FC = ({ children }) => {
  const Tracking = useContext(TrackingContext);
  const [explicitSemester, setExplicitSemester] = useState<
    string | undefined
  >();
  const checkExplicitSemester = useCallback(
    (
      semestersTaken:
        | { year: number; semester: string }[]
        | { year: number; semester: string }
    ) => {
      if (!!explicitSemester) {
        if (Array.isArray(semestersTaken)) {
          return semestersTaken.find(
            v => `${v.semester}${v.year}` === explicitSemester
          );
        }
        if (
          `${semestersTaken.semester}${semestersTaken.year}` ===
          explicitSemester
        ) {
          return semestersTaken;
        }
      }
      return undefined;
    },
    [explicitSemester]
  );
  const toggleExplicitSemester = useCallback(
    (year: number, semester: string) => {
      let open = false;
      setExplicitSemester(value => {
        const pair = `${semester}${year}`;
        if (value !== pair) {
          open = true;
          return pair;
        }
        return undefined;
      });
      return open;
    },
    [setExplicitSemester]
  );

  // ONLY ACTIVE[0] IS SHOWN AS ACTIVE
  // AL THE REST WORKS AS HISTORY
  const [{ active, flow, requisites, semestersTaken }, setState] = useState<{
    active: string[];
    semestersTaken: ISemesterTaken[][];
    flow: Record<string, boolean>[];
    requisites: Record<string, boolean>[];
  }>({ active: [], flow: [], requisites: [], semestersTaken: [] });

  useEffect(() => {
    Tracking.current.coursesOpen = active.join("|");
  }, [active]);

  const add = useCallback(
    ({
      course,
      flow,
      requisites,
      semestersTaken,
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
          ...state.flow,
        ];
        state.requisites = [
          requisites.reduce<Record<string, boolean>>(
            (ac, v) => ({ ...ac, [v]: true }),
            {}
          ),
          ...state.requisites,
        ];
        state.semestersTaken = [semestersTaken, ...state.semestersTaken];

        if (!checkExplicitSemester(semestersTaken)) {
          setExplicitSemester(undefined);
        }

        return { ...state };
      });
    },
    [setState, setExplicitSemester, checkExplicitSemester]
  );
  const remove = useCallback(
    (course: string) => {
      // REMOVE MEANS: IF THE COURSE IS FOUND, REMOVE IT FROM THE ACTIVE ARRAY AND FOLLOWS IT'S INDEX TO REMOVE THE CORRESPONDING DATA FROM FLOWREF AND REQUISITESREF
      setState(state => {
        const indexToRemove = state.active.findIndex(
          activeCourse => activeCourse === course
        );
        if (indexToRemove !== -1) {
          const stateActive = state.active.slice(0);
          stateActive.splice(indexToRemove, 1);
          state.active = stateActive;

          const stateFlow = state.flow.slice(0);
          stateFlow.splice(indexToRemove, 1);
          state.flow = stateFlow;

          const stateRequisites = state.requisites.slice(0);
          stateRequisites.splice(indexToRemove, 1);
          state.requisites = stateRequisites;

          const stateSemestersTaken = state.semestersTaken.slice(0);
          stateSemestersTaken.splice(indexToRemove, 1);
          state.semestersTaken = stateSemestersTaken;
        }

        return { ...state };
      });
    },
    [setState, setExplicitSemester, checkExplicitSemester]
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
        explicitSemester,
      }}
    >
      {children}
    </CoursesFlowContext.Provider>
  );
};
