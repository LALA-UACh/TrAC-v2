import React, { FC, memo, useContext, useMemo } from "react";

import {
  Badge,
  BadgeProps,
  Box,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";

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

  const isExplicitSemester = CoursesDashboardStore.hooks.useCheckExplicitSemester(
    { term, year },
    [term, year]
  );

  const borderColor = useMemo(() => {
    if (
      isExplicitSemester ||
      (explicitSemester === undefined &&
        semestersTaken?.find((v) => year === v.year && term == v.term))
    ) {
      return config.TAKEN_SEMESTER_BOX_ACTIVE;
    }
    return config.TAKEN_SEMESTER_BOX_INACTIVE;
  }, [
    explicitSemester,
    term,
    year,
    isExplicitSemester,
    semestersTaken,
    config,
  ]);

  const badgeProps = useMemo<BadgeProps>(() => {
    if (!comments) {
      return {};
    }
    switch (comments.toUpperCase()) {
      case "ELIM-REINC":
      case "REINCORP":
        return {
          colorScheme: "orange",
        };
      case "ELIMINADO":
        return {
          colorScheme: "red",
        };
      case "EGRESADO": {
        return {
          colorScheme: "blue",
        };
      }
      case "PENDIENTE":
        return {
          colorScheme: "purple",
        };
    }
    return {
      backgroundColor: "black",
      color: "white",
    };
  }, [comments]);

  const badgeBgColor = useColorModeValue(undefined, "#202020");

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
            <Badge
              bg={badgeBgColor}
              borderRadius="5px"
              fontSize="0.5em"
              {...badgeProps}
            >
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
