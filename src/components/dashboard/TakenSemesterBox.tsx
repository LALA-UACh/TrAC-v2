import React, { FC, memo, useContext, useMemo } from "react";

import { Badge, BadgeProps, Box, Stack } from "@chakra-ui/core";

import { termTypeToNumber } from "../../../constants";
import { ConfigContext } from "../Config";
import {
  useActiveSemestersTaken,
  useCheckExplicitSemester,
} from "./CoursesDashboardContext";

export const TakenSemesterBox: FC<{
  year: number;
  term: string;
  comments: string;
}> = memo(({ year, term, comments }) => {
  const config = useContext(ConfigContext);

  const [semestersTaken] = useActiveSemestersTaken();

  const [
    explicitSemester,
    { toggleExplicitSemester },
  ] = useCheckExplicitSemester({ semestersTaken: { year, term } });

  const borderColor = useMemo(() => {
    if (
      explicitSemester ||
      (explicitSemester === undefined &&
        semestersTaken?.find(v => year === v.year && term == v.term))
    ) {
      return config.TAKEN_SEMESTER_BOX_ACTIVE;
    }
    return config.TAKEN_SEMESTER_BOX_INACTIVE;
  }, [explicitSemester, term, year, semestersTaken, config]);

  const badgeProps = useMemo<BadgeProps>(() => {
    if (!comments) {
      return {};
    }
    switch (comments.toUpperCase()) {
      case "ELIM-REINC":
      case "REINCORP":
        return {
          variantColor: "orange",
        };
      case "ELIMINADO":
        return {
          variantColor: "red",
        };
      case "EGRESADO": {
        return {
          variantColor: "blue",
        };
      }
      case "PENDIENTE":
        return {
          variantColor: "purple",
        };
    }
    return {
      backgroundColor: "black",
      color: "white",
    };
  }, [comments]);

  return (
    <Box
      textAlign="center"
      border="3px solid"
      borderColor={borderColor}
      borderRadius="8px"
      backgroundColor={config.TAKEN_SEMESTER_BOX_BACKGROUND_COLOR}
      p="6px"
      ml={3}
      mr={3}
      fontSize="1.2em"
      cursor="pointer"
      className="unselectable"
      transition="all 0.4s ease-in-out"
      whiteSpace="nowrap"
      alignItems="center"
      display="flex"
      onClick={() => {
        toggleExplicitSemester({
          term,
          year,
        });
      }}
      color={config.TAKEN_SEMESTER_BOX_TEXT_COLOR}
      height="3em"
    >
      {comments ? (
        <Stack spacing={0}>
          <Box>
            <b>{`${termTypeToNumber(term)}S ${year}`}</b>
          </Box>
          <Box>
            <Badge borderRadius="5px" fontSize="0.5em" {...badgeProps}>
              {comments}
            </Badge>
          </Box>
        </Stack>
      ) : (
        <b>{`${termTypeToNumber(term)}S ${year}`}</b>
      )}
    </Box>
  );
});
