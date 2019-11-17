import { FC, useContext, useMemo } from "react";

import { Box } from "@chakra-ui/core";

import { CoursesFlowContext } from "./CoursesFlow";

export const SemesterTakenBox: FC<{ year: number; semester: string }> = ({
  year,
  semester
}) => {
  const {
    toggleExplicitSemester,
    semestersTaken,
    explicitSemester
  } = useContext(CoursesFlowContext);
  return useMemo(
    () => (
      <Box
        textAlign="center"
        border="3px solid"
        borderColor={
          `${semester}${year}` === explicitSemester ||
          semestersTaken?.find(v => v.semester === semester && v.year === year)
            ? "yellow.400"
            : "grey"
        }
        borderRadius="8px"
        backgroundColor="rgb(245,245,245)"
        p="6px"
        m={3}
        fontSize="1.2em"
        cursor="pointer"
        className="unselectable"
        transition="0.4s all ease-in-out"
        onClick={() => {
          toggleExplicitSemester(year, semester);
        }}
      >
        <b>{`${semester}S ${year}`}</b>
      </Box>
    ),
    [semester, year, toggleExplicitSemester, semestersTaken, explicitSemester]
  );
};
