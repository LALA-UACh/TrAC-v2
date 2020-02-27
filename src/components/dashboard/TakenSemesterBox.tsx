import React, { FC, memo, useContext, useMemo } from "react";

import { Badge, BadgeProps, Box, Stack } from "@chakra-ui/core";

import { termTypeToNumber } from "../../../constants";
import { ConfigContext } from "../../context/Config";
import { CoursesDashboardStore } from "../../context/CoursesDashboard";

export const TakenSemesterBox: FC<{
  year: number;
  term: string;
  comments: string;
}> = memo(({ year, term, comments }) => {
  const config = useContext(ConfigContext);

  const semestersTaken = CoursesDashboardStore.hooks.useActiveSemestersTaken();

  const explicitSemester = CoursesDashboardStore.hooks.useExplicitSemester();

  const borderColor = useMemo(() => {
    if (
      CoursesDashboardStore.actions.checkExplicitSemester({ term, year }) ||
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
      border={config.TAKEN_SEMESTER_BOX_BORDER}
      borderColor={borderColor}
      borderRadius={config.TAKEN_SEMESTER_BOX_BORDER_RADIUS}
      backgroundColor={config.TAKEN_SEMESTER_BOX_BACKGROUND_COLOR}
      p={config.TAKEN_SEMESTER_BOX_PADDING}
      ml={config.TAKEN_SEMESTER_BOX_MARGIN_SIDES}
      mr={config.TAKEN_SEMESTER_BOX_MARGIN_SIDES}
      fontSize={config.TAKEN_SEMESTER_BOX_FONT_SIZE}
      cursor="pointer"
      className="unselectable"
      transition={config.TAKEN_SEMESTER_BOX_TRANSITION}
      whiteSpace="nowrap"
      alignItems="center"
      display="flex"
      onClick={() => {
        CoursesDashboardStore.actions.toggleExplicitSemester({
          term,
          year,
        });
      }}
      color={config.TAKEN_SEMESTER_BOX_TEXT_COLOR}
      height={config.TAKEN_SEMESTER_BOX_HEIGHT}
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
