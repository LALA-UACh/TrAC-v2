import { scaleLinear } from "d3-scale";
import { AnimatePresence, motion } from "framer-motion";
import some from "lodash/some";
import { FC, useContext, useMemo, useState } from "react";
import { useUpdateEffect } from "react-use";

import { Box, Flex, Stack, Text } from "@chakra-ui/core";
import { HISTORIC_GRADES, StateCourse } from "@constants";
import { ICourse } from "@interfaces";
import { approvedGrade, maxGrade, minGrade } from "@temp";

import { CoursesFlowContext } from "./CoursesFlow";
import { Histogram } from "./Histogram";

export const CourseBox: FC<ICourse> = ({
  name,
  code,
  credits,
  historicDistribution,
  currentDistribution,
  registration,
  grade,
  currentDistributionLabel,
  historicalStates,
  state,
  flow,
  requisites,
  semestersTaken
}) => {
  const [max, setMax] = useState(false);
  const {
    add,
    remove,
    active,
    flow: contextFlow,
    requisites: contextRequisites,
    checkExplicitSemester,
    explicitSemester
  } = useContext(CoursesFlowContext);
  useUpdateEffect(() => {
    if (max) {
      add({
        course: code,
        flow,
        requisites,
        semestersTaken
      });
    } else {
      remove(code);
    }
  }, [max]);

  const approvedColorScale = useMemo(
    () =>
      scaleLinear<string, number>()
        .range(["#b0ffa1", "#5bff3b"])
        .domain([approvedGrade, maxGrade]),
    []
  );

  const reapprovedColorScale = useMemo(
    () =>
      scaleLinear<string, number>()
        .range(["#ff4040", "#ff8282"])
        .domain([minGrade, approvedGrade]),
    []
  );

  const h = useMemo(() => {
    if (max) {
      if (currentDistribution && historicDistribution) {
        return 350;
      } else {
        return 350 - 130;
      }
    }
    return 120;
  }, [max, currentDistribution, historicDistribution]);

  const stateColor = useMemo(() => {
    switch (state) {
      case StateCourse.Approved:
        return (approvedColorScale(grade || maxGrade) as unknown) as string;
      case StateCourse.Reapproved:
        return (reapprovedColorScale(grade || minGrade) as unknown) as string;
      case StateCourse.Current:
        return "blue";
      case StateCourse.Canceled:
        return "white";
      default:
        return "transparent";
    }
  }, [
    state,
    grade,
    maxGrade,
    minGrade,
    approvedColorScale,
    reapprovedColorScale
  ]);

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
    checkExplicitSemester
  ]);
  const borderColor = useMemo(() => {
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
    contextRequisites
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
      max && (
        <motion.div
          key="status"
          initial={{
            opacity: 0,
            transitionDuration: "0.2s",
            transitionDelay: "0.1s",
            transitionTimingFunction: "easy-in"
          }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transitionDuration: "0s",
            transitionDelay: "0s",
            transitionTimingFunction: "easy-in"
          }}
          style={{
            position: "absolute",
            top: "10px",
            right: "80px"
          }}
        >
          <Text fontSize="9px">
            <b>{registration}</b>
          </Text>
        </motion.div>
      ),
    [max, registration]
  );

  const CreditsComponent = useMemo(
    () =>
      !max && (
        <motion.div
          key="sct"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "absolute",
            bottom: "10px",
            left: "10px"
          }}
        >
          <Text fontSize="9px">
            <b>SCT: {credits}</b>
          </Text>
        </motion.div>
      ),
    [max, credits]
  );

  const ReqCircleComponent = useMemo(
    () =>
      (contextFlow?.[code] || contextRequisites?.[code]) && (
        <motion.div
          key="req_circle"
          initial={{
            opacity: 0,
            transitionDuration: "0.5s",
            transitionDelay: "0s",
            transitionTimingFunction: "easy-in"
          }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transitionDuration: "0.0s",
            transitionTimingFunction: "linear",
            transitionDelay: "0s"
          }}
          style={{ position: "absolute", right: 8, top: 80 }}
        >
          <Box>
            <svg width={32} height={32}>
              <circle
                r={15}
                cx={16}
                cy={16}
                stroke={
                  contextFlow?.[code] ? "rgb(66,153,225)" : "rgb(245,101,101)"
                }
                fill="transparent"
              />
              <text
                x={4}
                y={21}
                fontWeight="bold"
                fill={
                  contextFlow?.[code] ? "rgb(66,153,225)" : "rgb(245,101,101)"
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

  const HistogramsComponent = useMemo(
    () =>
      max && (
        <motion.div
          key="histograms"
          initial={{
            opacity: 0,
            transitionDuration: "0.5s",
            transitionDelay: "0s",
            transitionTimingFunction: "easy-in"
          }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transitionDuration: "0.0s",
            transitionTimingFunction: "linear",
            transitionDelay: "0s"
          }}
          style={{
            position: "absolute",
            bottom: 2
          }}
        >
          {currentDistribution && (
            <Histogram
              key="now"
              label={currentDistributionLabel}
              distribution={currentDistribution}
              grade={grade}
            />
          )}

          {historicDistribution && (
            <Histogram
              key="historic"
              label={HISTORIC_GRADES}
              distribution={historicDistribution}
              grade={grade}
            />
          )}
        </motion.div>
      ),
    [max, historicDistribution, currentDistribution, currentDistributionLabel]
  );

  const GradeComponent = useMemo(
    () =>
      grade !== undefined && (
        <Text mb={2} pt={1}>
          <b>
            {grade
              ? grade.toFixed(1)
              : (() => {
                  switch (state) {
                    case StateCourse.Approved:
                      return "AP";
                    case StateCourse.Reapproved:
                      return "RE";
                    case StateCourse.Canceled:
                      return "AN";
                    default:
                      return "BUGGED";
                  }
                })()}
          </b>
        </Text>
      ),
    [grade]
  );

  const HistoricalCirclesComponent = useMemo(
    () =>
      some(historicalStates) && (
        <Stack spacing={0.7}>
          {historicalStates?.map(({ state, grade: historicalGrade }, key) => {
            let color: string;
            switch (state) {
              case StateCourse.Reapproved:
                color = (reapprovedColorScale(
                  historicalGrade
                ) as unknown) as string;
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
    [historicalStates]
  );

  return (
    <Flex
      m={1}
      color="black"
      bg="rgb(245,245,245)"
      w={max ? 350 : 180}
      h={h}
      borderRadius={5}
      opacity={opacity}
      border="2px"
      borderColor={borderColor}
      borderWidth="2px"
      cursor="pointer"
      transition="0.5s all ease-in-out"
      onClick={() => {
        setMax(max => !max);
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
        mt="-0.5px"
        h="100.5%"
        bg={stateColor}
        direction="column"
        alignItems="center"
        borderRadius="0px 3px 3px 0px"
        zIndex={0}
        transition="0.5s height ease-in-out"
        border="1px solid"
        borderColor={borderColor}
      >
        {GradeComponent}

        {HistoricalCirclesComponent}
      </Flex>
    </Flex>
  );
};
