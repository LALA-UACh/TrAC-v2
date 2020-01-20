import { scaleLinear } from "d3-scale";
import { AnimatePresence, motion } from "framer-motion";
import { some, truncate } from "lodash";
import React, { FC, useContext, useMemo, useState } from "react";
import ReactTooltip from "react-tooltip";
import { useDebounce, useUpdateEffect } from "react-use";
import { Checkbox } from "semantic-ui-react";

import { Badge, Box, Flex, Stack, Text } from "@chakra-ui/core";

import { StateCourse, termTypeToNumber } from "../../../constants";
import { ICourse, ITakenCourse } from "../../../interfaces";
import { TrackingContext } from "../../components/Tracking";
import { ConfigContext } from "../Config";
import { ForeplanContext } from "../foreplan/ForeplanContext";
import { CoursesDashboardContext } from "./CoursesDashboardContext";
import { Histogram } from "./Histogram";

export const passColorScale = scaleLinear<string, number>();

export const failColorScale = scaleLinear<string, number>();

export const CourseBox: FC<ICourse> = ({
  name,
  code,
  credits,
  flow,
  requisites,
  historicDistribution,
  taken,
  bandColors,
}) => {
  const config = useContext(ConfigContext);
  const Tracking = useContext(TrackingContext);
  const {
    dispatch: dispatchDashboard,
    activeCourse,
    flow: contextFlow,
    requisites: contextRequisites,
    checkExplicitSemester,
    explicitSemester,
  } = useContext(CoursesDashboardContext);
  const foreplanCtx = useContext(ForeplanContext);

  const { semestersTaken } = useMemo(() => {
    const semestersTaken = taken.map(({ term, year }) => {
      return { term, year };
    });

    return { semestersTaken };
  }, [taken]);

  const {
    state,
    grade,
    registration,
    currentDistribution,
    term,
    year,
    parallelGroup,
  } = useMemo<Partial<ITakenCourse>>(() => {
    const foundSemesterTaken = checkExplicitSemester(semestersTaken);
    if (foundSemesterTaken) {
      const foundData = taken.find(({ term, year }) => {
        return (
          year === foundSemesterTaken.year && term === foundSemesterTaken.term
        );
      });
      return foundData || {};
    }
    return taken[0] || {};
  }, [semestersTaken, explicitSemester, checkExplicitSemester, taken]);

  const [open, setOpen] = useState(() => {
    try {
      if (localStorage.getItem(`${code}_active`)) {
        return true;
      }
    } catch (err) {}

    return false;
  });

  useDebounce(
    () => {
      try {
        if (open) {
          localStorage.setItem(`${code}_active`, "1");
        } else {
          localStorage.removeItem(`${code}_active`);
        }
      } catch (err) {}
    },
    3000,
    [open]
  );

  useUpdateEffect(() => {
    setOpen(false);
  }, [code]);

  const { height, width } = useMemo(() => {
    let height: number | undefined = undefined;
    let width: number | undefined = undefined;
    if (open) {
      const currentDistr = taken[0]?.currentDistribution;
      if (currentDistr && some(currentDistr, ({ value }) => value)) {
        width = 350;
        if (
          historicDistribution &&
          some(historicDistribution, ({ value }) => value)
        ) {
          height = 350;
        } else {
          height = 350 - 130;
        }
      } else if (
        historicDistribution &&
        some(historicDistribution, ({ value }) => value)
      ) {
        width = 350;
        height = 350 - 130;
      }
    } else {
      width = 180;
      height = 120;
    }
    if (!width) {
      width = 220;
    }
    if (!height) {
      height = 140;
    }

    return { height, width };
  }, [taken, historicDistribution, open]);

  const stateColor = useMemo(() => {
    const bandColorsCourse = taken?.[0]?.bandColors ?? bandColors;

    switch (state) {
      case StateCourse.Passed: {
        const gradeToCompare = grade ?? config.MAX_GRADE;

        return (
          bandColorsCourse.find(({ min, max }) => {
            return gradeToCompare <= max && gradeToCompare >= min;
          })?.color ??
          bandColorsCourse[bandColorsCourse.length - 1]?.color ??
          config.STATE_COLOR_PASS_FALLBACK
        );
      }
      case StateCourse.Failed: {
        const gradeToCompare = grade ?? config.MIN_GRADE;
        return (
          bandColorsCourse.find(({ min, max }) => {
            return gradeToCompare <= max && gradeToCompare >= min;
          })?.color ??
          bandColorsCourse[0]?.color ??
          config.STATE_COLOR_FAIL_FALLBACK
        );
      }
      case StateCourse.Current: {
        return config.STATE_COURSE_CURRENT_COLOR;
      }
      case StateCourse.Canceled: {
        return config.STATE_COURSE_CANCELED_COLOR;
      }
      case StateCourse.Pending: {
        return config.STATE_COURSE_PENDING_COLOR;
      }
      default: {
        return "transparent";
      }
    }
  }, [grade, bandColors, taken, config]);

  const opacity = (() => {
    if (activeCourse) {
      if (
        activeCourse === code ||
        contextFlow?.[code] ||
        contextRequisites?.[code]
      ) {
        return 1;
      }
    }

    if (explicitSemester) {
      if (checkExplicitSemester(semestersTaken)) {
        return 1;
      }
      return 0.5;
    }
    if (!activeCourse && !explicitSemester) {
      return 1;
    }
    return 0.5;
  })();

  const borderColor = (() => {
    if (activeCourse === code) {
      return config.ACTIVE_COURSE_BOX_COLOR;
    }
    if (contextFlow?.[code]) {
      return config.FLOW_COURSE_BOX_COLOR;
    }
    if (contextRequisites?.[code]) {
      return config.REQUISITE_COURSE_BOX_COLOR;
    }
    if (checkExplicitSemester(semestersTaken)) {
      return config.EXPLICIT_SEMESTER_COURSE_BOX_COLOR;
    }
    return config.INACTIVE_COURSE_BOX_COLOR;
  })();

  const NameComponent = useMemo(() => {
    return (
      <Stack spacing={1}>
        <Flex alignItems="center">
          <Text m={0} whiteSpace="nowrap">
            <b>{taken?.find(({ equiv }) => equiv)?.equiv || code}</b>
          </Text>
          {!!parallelGroup && (
            <Badge
              ml={2}
              backgroundColor={config.PARALLEL_GROUP_BACKGROUND_COLOR}
              color={config.PARALLEL_GROUP_LABEL_COLOR}
            >
              {config.PARALLEL_GROUP_LABEL}: {parallelGroup}
            </Badge>
          )}
        </Flex>

        <Text fontSize={9} maxWidth="150px">
          {truncate(name, { length: open ? 60 : 35 })}
        </Text>
      </Stack>
    );
  }, [code, name, taken, config, open]);

  const RegistrationComponent = useMemo(
    () =>
      registration &&
      open && (
        <motion.div
          key="status"
          initial={{
            opacity: 0,
          }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
          }}
          style={{ width: "100%" }}
        >
          <Text fontSize="9px" mr={2} textAlign="end">
            <b>{registration}</b>
          </Text>
        </motion.div>
      ),
    [open, registration]
  );

  const CreditsComponent = useMemo(
    () =>
      !open && (
        <motion.div
          key="credits"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Box pos="absolute" bottom="10px" left="10px">
            {credits.map(({ label, value }, key) => {
              return (
                value !== -1 && (
                  <Text fontSize="9px" key={key}>
                    <b>{`${label}: ${value}`}</b>
                  </Text>
                )
              );
            })}
          </Box>
        </motion.div>
      ),
    [open, credits]
  );

  const ReqCircleComponent = useMemo(
    () =>
      (contextFlow?.[code] || contextRequisites?.[code]) && (
        <motion.div
          key="req_circle"
          initial={{
            opacity: 0,
          }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
          }}
        >
          <Box mt="-10px" pos="absolute" right="8px" top="80px">
            <svg width={32} height={32}>
              <circle
                r={15}
                cx={16}
                cy={16}
                stroke={
                  contextFlow?.[code]
                    ? config.FLOW_CIRCLE_COLOR
                    : config.REQ_CIRCLE_COLOR
                }
                fill="transparent"
              />
              <text
                x={4}
                y={21}
                fontWeight="bold"
                fill={
                  contextFlow?.[code]
                    ? config.FLOW_CIRCLE_COLOR
                    : config.REQ_CIRCLE_COLOR
                }
              >
                {contextFlow?.[code]
                  ? config.FLOW_CIRCLE_LABEL
                  : config.REQ_CIRCLE_LABEL}
              </text>
            </svg>
          </Box>
        </motion.div>
      ),
    [contextFlow, contextRequisites, code, config]
  );

  const HistogramNow = useMemo(() => {
    const currentDistributionLabel = ({
      term,
      year,
    }: {
      term: string | number;
      year: number;
    }) => {
      return `${config.GRADES_LABEL} ${term} ${year}`;
    };

    return (
      currentDistribution &&
      some(currentDistribution, ({ value }) => value) &&
      term &&
      year && (
        <Histogram
          key="now"
          label={currentDistributionLabel({
            term: termTypeToNumber(term),
            year,
          })}
          distribution={currentDistribution}
          grade={grade}
          bandColors={taken?.[0]?.bandColors ?? bandColors}
        />
      )
    );
  }, [currentDistribution, term, year, grade, taken, config]);

  const HistogramHistoric = useMemo(() => {
    return historicDistribution &&
      some(historicDistribution, ({ value }) => value) ? (
      <Histogram
        key="historic"
        label={config.HISTORIC_GRADES}
        distribution={historicDistribution}
        grade={grade}
        bandColors={bandColors}
      />
    ) : (
      <Badge>{config.NO_HISTORIC_DATA}</Badge>
    );
  }, [historicDistribution, grade, config]);

  const HistogramsComponent = useMemo(
    () =>
      open && (
        <motion.div
          key="histograms"
          initial={{
            opacity: 0,
            scale: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          exit={{
            opacity: 0,
            scale: 0.4,
          }}
          className="histogram_box"
        >
          {HistogramNow}

          {HistogramHistoric}
        </motion.div>
      ),
    [open, HistogramNow, HistogramHistoric]
  );

  const GradeComponent = useMemo(() => {
    return (
      grade !== undefined && (
        <Text mb={2} pt={1}>
          <b>
            {(() => {
              if (grade) {
                return grade.toFixed(1);
              }
              switch (state) {
                case StateCourse.Passed:
                  return config.STATE_PASSED_LABEL_MINI;
                case StateCourse.Failed:
                  return config.STATE_FAILED_LABEL_MINI;
                case StateCourse.Canceled:
                  return config.STATE_CANCELED_LABEL_MINI;
                case StateCourse.Pending:
                  return config.STATE_PENDING_LABEL_MINI;
                case StateCourse.Current:
                  return config.STATE_CURRENT_LABEL_MINI;
                default:
                  return "BUG";
              }
            })()}
          </b>
        </Text>
      )
    );
  }, [grade, state, config, code]);

  const HistoricalCirclesComponent = useMemo(
    () =>
      taken.length > 1 && (
        <Stack spacing={0.7}>
          {taken.slice(1).map(({ state, grade }, key) => {
            let color: string;
            let tooltipType:
              | "dark"
              | "success"
              | "warning"
              | "error"
              | "info"
              | "light";
            let tooltipLabel: number | string | undefined = grade;
            switch (state) {
              case StateCourse.Failed:
                tooltipType = "error";
                color = (failColorScale(grade || 0) as unknown) as string;
                break;
              case StateCourse.Current:
                tooltipType = "info";
                color = config.STATE_COURSE_CURRENT_COLOR;
                break;
              case StateCourse.Canceled:
                tooltipLabel = config.CANCELED_HISTORIC_TOOLTIP_LABEL;
                tooltipType = "light";
                color = config.STATE_COURSE_CANCELED_COLOR;
                break;
              case StateCourse.Pending:
                tooltipType = "dark";
                color = config.STATE_COURSE_PENDING_COLOR;
                break;
              default:
                return null;
            }
            const tooltipKey = `code_historic_state_${code}_${key}`;
            return (
              <Box
                key={key}
                m={0}
                p={0}
                paddingBottom="0px"
                color={color}
                height={"16px"}
                width={"16px"}
              >
                <svg
                  width={16}
                  height={16}
                  data-tip={tooltipLabel}
                  data-for={tooltipKey}
                >
                  <circle
                    cx={8}
                    cy={8}
                    r="6"
                    stroke={config.STATE_COURSE_CIRCLE_STROKE}
                    fill={color}
                  />
                </svg>
                <ReactTooltip id={tooltipKey} type={tooltipType} />
              </Box>
            );
          })}
        </Stack>
      ),
    [taken, config, code]
  );

  const { ForeplanCourseCheckbox } = useMemo(() => {
    const { state } = taken[0] || {};
    if (
      foreplanCtx.active &&
      (state === undefined ||
        state === StateCourse.Failed ||
        state === StateCourse.Canceled)
    ) {
      const checked = !!foreplanCtx.foreplanCourses[code];
      const ForeplanCourseCheckbox = (
        <motion.div
          key="foreplanCourseCheckbox"
          initial={{
            opacity: 0,
          }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
          }}
          className="foreplanCourseCheckbox"
        >
          <Flex height="100%" direction="column" justifyContent="flex-end">
            <Box mb={1}>
              <Checkbox
                checked={checked}
                onChange={ev => {
                  ev.stopPropagation();
                  foreplanCtx.dispatch({
                    type: checked
                      ? "removeCourseForeplan"
                      : "addCourseForeplan",
                    payload: code,
                  });
                }}
              />
            </Box>
          </Flex>
        </motion.div>
      );

      return { ForeplanCourseCheckbox };
    }
    return {};
  }, [foreplanCtx, code, state, taken]);

  return (
    <Flex
      m={1}
      color={config.COURSE_BOX_TEXT_COLOR}
      bg={config.COURSE_BOX_BACKGROUND_COLOR}
      width={width}
      height={height}
      borderRadius={5}
      opacity={opacity}
      border={config.COURSE_BOX_BORDER_WIDTH_INACTIVE}
      borderColor={borderColor}
      borderWidth={
        activeCourse === code
          ? config.COURSE_BOX_BORDER_WIDTH_ACTIVE
          : config.COURSE_BOX_BORDER_WIDTH_INACTIVE
      }
      cursor="pointer"
      transition="all 0.4s ease-in-out"
      onClick={() => {
        setOpen(open => !open);

        if (!open) {
          dispatchDashboard({
            type: "addCourse",
            payload: {
              course: code,
              flow,
              requisites,
              semestersTaken,
            },
          });
        } else {
          dispatchDashboard({
            type: "removeCourse",
            payload: code,
          });
        }

        Tracking.current.track({
          action: "click",
          target: `course-box-${code}`,
          effect: `${open ? "close" : "open"}-course-box`,
        });
      }}
      className="unselectable courseBox"
    >
      <Flex
        w="100%"
        h="100%"
        pt={2}
        pl={2}
        pos="relative"
        className="mainBlock"
      >
        {NameComponent}

        <AnimatePresence>
          {RegistrationComponent}
          {CreditsComponent}

          {ReqCircleComponent}

          {HistogramsComponent}
        </AnimatePresence>
      </Flex>
      <Flex
        mr={"-0.5px"}
        w="40px"
        mt="-0.4px"
        h="100.5%"
        bg={stateColor}
        direction="column"
        alignItems="center"
        borderRadius="0px 3px 3px 0px"
        zIndex={0}
        transition="all 0.4s ease-in-out"
        borderLeft="1px solid"
        borderColor={borderColor}
        className="secondaryBlock"
      >
        {GradeComponent}

        {HistoricalCirclesComponent}
        <AnimatePresence>{ForeplanCourseCheckbox}</AnimatePresence>
      </Flex>
    </Flex>
  );
};
