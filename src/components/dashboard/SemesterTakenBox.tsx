import { FC, useContext, useMemo } from "react";

import { Box } from "@chakra-ui/core";
import { TrackingContext } from "@components/Tracking";

import { CoursesFlowContext } from "./CoursesFlow";

export const SemesterTakenBox: FC<{ year: number; semester: string }> = ({
  year,
  semester,
}) => {
  const Tracking = useContext(TrackingContext);
  const {
    toggleExplicitSemester,
    checkExplicitSemester,
    semestersTaken,
    explicitSemester,
  } = useContext(CoursesFlowContext);

  const borderColor = useMemo(() => {
    if (
      checkExplicitSemester({ year, semester }) ||
      (explicitSemester === undefined &&
        semestersTaken?.find(v => year === v.year && semester == v.semester))
    ) {
      return "yellow.400";
    }
    return "grey";
  }, [semester, year, checkExplicitSemester, semestersTaken]);

  return useMemo(
    () => (
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
          const open = toggleExplicitSemester(year, semester);
          Tracking.current.track({
            action: "click",
            target: `semester-box-${year}-${semester}`,
            effect: `${open ? "load" : "unload"}-semester`,
          });
        }}
      >
        <b>{`${semester}S ${year}`}</b>
      </Box>
    ),
    [semester, year, toggleExplicitSemester, borderColor]
  );
};
