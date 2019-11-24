import { FC, memo, useContext, useMemo } from "react";

import { Box } from "@chakra-ui/core";
import { TrackingContext } from "@components/Tracking";

import { CoursesFlowContext } from "./CoursesFlow";

export const SemesterTakenBox: FC<{ year: number; term: string }> = memo(
  ({ year, term }) => {
    const Tracking = useContext(TrackingContext);
    const {
      toggleExplicitSemester,
      checkExplicitSemester,
      semestersTaken,
      explicitSemester,
    } = useContext(CoursesFlowContext);

    const borderColor = useMemo(() => {
      if (
        checkExplicitSemester({ year, term }) ||
        (explicitSemester === undefined &&
          semestersTaken?.find(v => year === v.year && term == v.term))
      ) {
        return "yellow.400";
      }
      return "grey";
    }, [term, year, checkExplicitSemester, semestersTaken]);

    return (
      <Box
        textAlign="center"
        border="3px solid"
        borderColor={borderColor}
        borderRadius="8px"
        backgroundColor="rgb(245,245,245)"
        p="6px"
        m={3}
        fontSize="1.2em"
        cursor="pointer"
        className="unselectable"
        transition="0.4s all ease-in-out"
        onClick={() => {
          const open = toggleExplicitSemester(year, term);
          Tracking.current.track({
            action: "click",
            target: `semester-box-${year}-${term}`,
            effect: `${open ? "load" : "unload"}-semester`,
          });
        }}
      >
        <b>{`${term}S ${year}`}</b>
      </Box>
    );
  }
);
