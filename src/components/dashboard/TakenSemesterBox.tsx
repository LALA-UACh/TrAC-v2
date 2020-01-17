import React, { FC, memo, useContext, useMemo } from "react";

import { Badge, BadgeProps, Box, Stack } from "@chakra-ui/core";

import { termTypeToNumber } from "../../../constants";
import { ConfigContext } from "../Config";
import { TrackingContext } from "../Tracking";
import { CoursesFlowContext } from "./CoursesFlow";

export const TakenSemesterBox: FC<{
  year: number;
  term: string;
  comments: string;
}> = memo(({ year, term, comments }) => {
  const config = useContext(ConfigContext);
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
      return config.TAKEN_SEMESTER_BOX_ACTIVE;
    }
    return config.TAKEN_SEMESTER_BOX_INACTIVE;
  }, [term, year, checkExplicitSemester, semestersTaken, config]);

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
      mt={0}
      mb={3}
      ml={3}
      mr={3}
      fontSize="1.2em"
      cursor="pointer"
      className="unselectable"
      transition="0.4s all ease-in-out"
      whiteSpace="nowrap"
      alignItems="center"
      display="flex"
      onClick={() => {
        const open = toggleExplicitSemester(year, term);
        Tracking.current.track({
          action: "click",
          target: `semester-box-${year}-${term}`,
          effect: `${open ? "load" : "unload"}-semester`,
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
