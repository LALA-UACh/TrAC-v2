import { scaleLinear } from "d3-scale";
import { AnimatePresence, motion } from "framer-motion";
import { FC, useContext, useMemo, useState } from "react";
import { useUpdateEffect } from "react-use";

import { Box, Flex, Stack, Text } from "@chakra-ui/core";
import { TrackingContext } from "@components/Tracking";
import { HISTORIC_GRADES, StateCourse } from "@constants";
import { ICourse, ITakenCourse } from "@interfaces";
import { maxGrade, minGrade, passGrade } from "@temp";

import { CoursesFlowContext } from "./CoursesFlow";
import { Histogram } from "./Histogram";

export const CourseBox: FC<ICourse> = ({
  name,
  code,
  credits,
  flow,
  requisites,
  historicDistribution,
  taken,
}) => {
  const Tracking = useContext(TrackingContext);
  const { semestersTaken } = useMemo(() => {
    const semestersTaken = taken.map(({ semester, year }) => {
      return { semester, year };
    });

    return { semestersTaken };
  }, [taken]);

  const {
    add,
    remove,
    active,
    flow: contextFlow,
    requisites: contextRequisites,
    checkExplicitSemester,
    explicitSemester,
  } = useContext(CoursesFlowContext);

  const {
    state,
    grade,
    registration,
    currentDistribution,
    semester,
    year,
  } = useMemo<Partial<ITakenCourse>>(() => {
    const foundSemesterTaken = checkExplicitSemester(semestersTaken);
    if (foundSemesterTaken) {
      const foundData = taken.find(({ semester, year }) => {
        return (
          year === foundSemesterTaken.year &&
          semester === foundSemesterTaken.semester
        );
      });
      return foundData || {};
    }
    return taken[0] || {};
  }, [semestersTaken, explicitSemester, checkExplicitSemester, taken]);

  const [open, setOpen] = useState(false);

  useUpdateEffect(() => {
    if (open) {
      add({
        course: code,
        flow,
        requisites,
        semestersTaken,
      });
    } else {
      remove(code);
    }
  }, [open]);

  const passColorScale = useMemo(
    () =>
      scaleLinear<string, number>()
        .range(["#b0ffa1", "#5bff3b"])
        .domain([passGrade, maxGrade]),
    []
  );

  const failColorScale = useMemo(
    () =>
      scaleLinear<string, number>()
        .range(["#ff4040", "#ff8282"])
        .domain([minGrade, passGrade]),
    []
  );

  const h = useMemo(() => {
    if (open) {
      if (taken[0]?.currentDistribution && historicDistribution) {
        return 350;
      } else {
        return 350 - 130;
      }
    }
    return 120;
  }, [open, taken, historicDistribution]);

  const stateColor = useMemo(() => {
    switch (state) {
      case StateCourse.Passed:
        return (passColorScale(grade || maxGrade) as unknown) as string;
      case StateCourse.Failed:
        return (failColorScale(grade || minGrade) as unknown) as string;
      case StateCourse.Current:
        return "blue";
      case StateCourse.Canceled:
        return "white";
      default:
        return "transparent";
    }
  }, [state, grade, maxGrade, minGrade, passColorScale, failColorScale]);

  const opacity = useMemo(() => {
    if (active) {
      if (active === code || contextFlow?.[code] || contextRequisites?.[code]) {
        return 1;
      }
    }

    if (explicitSemester) {
      if (checkExplicitSemester(semestersTaken)) {
        return 1;
      }
      return 0.5;
    }
    if (!active && !explicitSemester) {
      return 1;
    }
    return 0.5;
  }, [
    active,
    code,
    contextFlow,
    contextRequisites,
    explicitSemester,
    semestersTaken,
    checkExplicitSemester,
  ]);
  const borderColor = useMemo(() => {
    if (active === code) {
      return "gray.500";
    }
    if (contextFlow?.[code]) {
      return "red.400";
    }
    if (contextRequisites?.[code]) {
      return "blue.400";
    }
    if (checkExplicitSemester(semestersTaken)) {
      return "yellow.400";
    }
    return "gray.400";
  }, [
    active,
    code,
    explicitSemester,
    checkExplicitSemester,
    semestersTaken,
    contextFlow,
    contextRequisites,
  ]);

  const NameComponent = useMemo(
    () => (
      <Stack spacing={1}>
        <Text>
          <b>{code}</b>
        </Text>
        <Text fontSize={9} maxWidth="150px">
          {name}
        </Text>
      </Stack>
    ),
    [code, name]
  );

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
          className="registration_box"
        >
          <Text fontSize="9px">
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
          key="sct"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="credits_box"
        >
          {credits.map(({ label, value }, key) => {
            return (
              <Text fontSize="9px" key={key}>
                <b>{`${label}: ${value}`}</b>
              </Text>
            );
          })}
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
          className="req_circle_box"
        >
          <Box>
            <svg width={32} height={32}>
              <circle
                r={15}
                cx={16}
                cy={16}
                stroke={
                  contextFlow?.[code] ? "rgb(245,101,101)" : "rgb(66,153,225)"
                }
                fill="transparent"
              />
              <text
                x={4}
                y={21}
                fontWeight="bold"
                fill={
                  contextFlow?.[code] ? "rgb(245,101,101)" : "rgb(66,153,225)"
                }
              >
                {contextFlow?.[code] ? "Fluj" : "Req"}
              </text>
            </svg>
          </Box>
        </motion.div>
      ),
    [contextFlow, contextRequisites, code]
  );

  const HistogramNow = useMemo(
    () =>
      currentDistribution && (
        <Histogram
          key="now"
          label={`Calificationes ${semester} ${year}`}
          distribution={currentDistribution}
          grade={grade}
        />
      ),
    [currentDistribution, semester, year, grade]
  );

  const HistogramHistoric = useMemo(
    () =>
      historicDistribution && (
        <Histogram
          key="historic"
          label={HISTORIC_GRADES}
          distribution={historicDistribution}
          grade={grade}
        />
      ),
    [historicDistribution, grade]
  );

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
                  return "AP";
                case StateCourse.Failed:
                  return "RE";
                case StateCourse.Canceled:
                  return "AN";
                case StateCourse.Pending:
                  return "PEN";
                case StateCourse.Current:
                  return "CUR";
                default:
                  return "BUG";
              }
            })()}
          </b>
        </Text>
      )
    );
  }, [grade, state]);

  const HistoricalCirclesComponent = useMemo(
    () =>
      taken.length > 1 && (
        <Stack spacing={0.7}>
          {taken.slice(1).map(({ state, grade }, key) => {
            let color: string;
            switch (state) {
              case StateCourse.Failed:
                color = (failColorScale(grade || 0) as unknown) as string;
                break;
              case StateCourse.Current:
                color = "blue";
                break;
              case StateCourse.Canceled:
                color = "white";
              default:
                color = "black";
            }
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
                <svg width={16} height={16}>
                  <circle cx={8} cy={8} r="6" stroke="white" fill={color} />
                </svg>
              </Box>
            );
          })}
        </Stack>
      ),
    [taken]
  );

  return (
    <Flex
      m={1}
      color="black"
      bg="rgb(245,245,245)"
      w={open ? 350 : 180}
      h={h}
      borderRadius={5}
      opacity={opacity}
      border="2px"
      borderColor={borderColor}
      borderWidth={active === code ? "3.5px" : "2px"}
      cursor="pointer"
      transition="0.4s all ease-in-out"
      onClick={() => {
        setOpen(open => !open);

        Tracking.current.track({
          action: "click",
          target: `course-box-${code}`,
          effect: `${open ? "close" : "open"}-course-box`,
        });
      }}
      className="unselectable"
    >
      <Flex w="100%" h="100%" pt={2} pl={2} pos="relative">
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
        transition="0.4s all ease-in-out"
        border="1px solid"
        borderColor={borderColor}
      >
        {GradeComponent}

        {HistoricalCirclesComponent}
      </Flex>
    </Flex>
  );
};
