import classNames from "classnames";
import { scaleLinear } from "d3-scale";
import { AnimatePresence, motion } from "framer-motion";
import { some, truncate } from "lodash";
import dynamic from "next/dynamic";
import React, { FC, memo, useContext, useMemo } from "react";
import { Theme } from "react-toggle-theme";
import ReactTooltip from "react-tooltip";

import { Badge, Box, Flex, Stack, Text } from "@chakra-ui/core";

import { StateCourse, termTypeToNumber } from "../../../constants";
import { ICourse, ITakenCourse, ITakenSemester } from "../../../interfaces";
import { ConfigContext } from "../../context/Config";
import {
  pairTermYear,
  useActiveCourse,
  useActiveFlow,
  useActiveRequisites,
  useCheckExplicitSemester,
  useDashboardCoursesActions,
  useDashboardIsCourseOpen,
  useExplicitSemester,
} from "../../context/CoursesDashboardContext";
import {
  useForeplanIsDirectTake,
  useForeplanIsFutureCourseRequisitesFulfilled,
  useIsForeplanActive,
  useIsPossibleToTakeForeplan,
} from "../../context/ForeplanContext";
import { useTracking } from "../../context/Tracking";
import { useTheme } from "../../utils/darkMode";
import { useUser } from "../../utils/useUser";
import styles from "./CourseBox.module.css";
import { Histogram } from "./Histogram";

const ForeplanCourseCheckbox = dynamic(() =>
  import("../foreplan/courseBox/Checkbox")
);

const ForeplanCourseStats = dynamic(() =>
  import("../foreplan/courseBox/Stats")
);

export const passColorScale = scaleLinear<string, number>();

export const failColorScale = scaleLinear<string, number>();

export type CurrentTakenData = Partial<ITakenCourse>;

const useIsCourseFuturePlanificationFulfilled = ({
  state,
  code,
}: {
  state?: StateCourse;
  code: string;
}) => {
  const { user } = useUser({
    fetchPolicy: "cache-only",
  });
  const [isForeplanActive] = useIsForeplanActive();
  const [isPossibleToTakeForeplan] = useIsPossibleToTakeForeplan({
    state,
  });
  const [isDirectTake] = useForeplanIsDirectTake({ code });
  const [
    isFutureCourseRequisitesFulfilled,
  ] = useForeplanIsFutureCourseRequisitesFulfilled({
    code,
  });

  return (
    (user?.config.FOREPLAN_FUTURE_COURSE_PLANIFICATION ?? false) &&
    isForeplanActive &&
    isPossibleToTakeForeplan &&
    !isDirectTake &&
    isFutureCourseRequisitesFulfilled
  );
};

const OuterCourseBox: FC<Pick<ICourse, "code" | "historicDistribution"> & {
  isOpen: boolean;
  borderColor: string;
  semestersTaken: ITakenSemester[];
} & Pick<CurrentTakenData, "currentDistribution"> & {
    isFutureCourseFulfilled: boolean;
  }> = memo(
  ({
    children,
    code,
    currentDistribution,
    historicDistribution,
    semestersTaken,
    borderColor,
    isOpen,
    isFutureCourseFulfilled,
  }) => {
    const config = useContext(ConfigContext);

    const [activeCourse] = useActiveCourse({ code });
    const [explicitSemester, { checkExplicitSemester }] = useExplicitSemester();

    const opacity = useMemo(() => {
      if (activeCourse) {
        return 1;
      }
      if (explicitSemester) {
        if (checkExplicitSemester(semestersTaken)) {
          return 1;
        }
        return 0.5;
      }
      return 1;
    }, [code, activeCourse, explicitSemester]);

    const { height, width } = useMemo(() => {
      let height: number | undefined = undefined;
      let width: number | undefined = undefined;
      if (isOpen) {
        if (
          currentDistribution &&
          some(currentDistribution, ({ value }) => value)
        ) {
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
    }, [isOpen, historicDistribution, currentDistribution]);

    const borderWidth =
      activeCourse || isFutureCourseFulfilled
        ? config.COURSE_BOX_BORDER_WIDTH_ACTIVE
        : config.COURSE_BOX_BORDER_WIDTH_INACTIVE;

    return (
      <Flex
        m={1}
        color={config.COURSE_BOX_TEXT_COLOR}
        width={width}
        height={height}
        borderRadius={5}
        opacity={opacity}
        boxShadow={`0px 0px 0px ${borderWidth} ${borderColor}`}
        transition={config.COURSE_BOX_ALL_TRANSITION_DURATION}
        className="unselectable courseBox"
        padding={0}
        overflow="hidden"
      >
        {children}
      </Flex>
    );
  }
);

const MainBlockOuter: FC<Pick<ICourse, "code" | "flow" | "requisites"> & {
  semestersTaken: ITakenSemester[];
}> = memo(({ children, code, flow, requisites, semestersTaken }) => {
  const [, { track }] = useTracking();
  const [, { addCourse, removeCourse }] = useDashboardCoursesActions();
  const [isOpen, { toggleOpenCourse }] = useDashboardIsCourseOpen({ code });
  const config = useContext(ConfigContext);
  return (
    <Flex
      w="100%"
      h="100%"
      pt={2}
      pl={2}
      pos="relative"
      className="mainBlock"
      cursor="pointer"
      borderRadius={5}
      bg={config.COURSE_BOX_BACKGROUND_COLOR}
      onClick={() => {
        toggleOpenCourse(code);

        if (!isOpen) {
          addCourse({
            course: code,
            flow,
            requisites,
            semestersTaken,
          });
        } else {
          removeCourse(code);
        }

        track({
          action: "click",
          target: `course-box-${code}`,
          effect: `${isOpen ? "close" : "open"}-course-box`,
        });
      }}
    >
      {children}
    </Flex>
  );
});

const NameComponent: FC<Pick<ICourse, "code" | "taken" | "name"> & {
  isOpen: boolean;
} & Pick<CurrentTakenData, "parallelGroup">> = memo(
  ({ code, name, taken, parallelGroup, isOpen }) => {
    const config = useContext(ConfigContext);
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

        <Text fontSize={9} maxWidth="150px" pr={1}>
          {truncate(name, { length: isOpen ? 60 : 35 })}
        </Text>
      </Stack>
    );
  }
);

const SecondaryBlockOuter: FC<Pick<ICourse, "taken" | "bandColors"> &
  Pick<CurrentTakenData, "grade" | "state"> & {
    borderColor: string;
  }> = memo(({ children, taken, bandColors, borderColor, state, grade }) => {
  const config = useContext(ConfigContext);

  const [theme] = useTheme();

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
        return theme === Theme.LIGHT
          ? config.COURSE_BOX_BACKGROUND_COLOR
          : undefined;
      }
    }
  }, [state, theme, grade, bandColors, taken, config]);

  return (
    <Flex
      w="40px"
      h="125.5%"
      bg={stateColor}
      direction="column"
      alignItems="center"
      zIndex={-100}
      transition="all 0.4s ease-in-out"
      borderLeft="1px solid"
      borderColor={borderColor}
      className="secondaryBlock"
    >
      {children}
    </Flex>
  );
});

const RegistrationComponent: FC<Pick<CurrentTakenData, "registration">> = memo(
  ({ registration }) => {
    return (
      <motion.div
        key="status"
        initial={{
          opacity: 0,
          position: "static",
        }}
        animate={{ opacity: 1 }}
        exit={{
          opacity: 0,
          position: "absolute",
        }}
        style={{ width: "100%" }}
      >
        <Text fontSize="9px" mr={2} textAlign="end">
          <b>{registration}</b>
        </Text>
      </motion.div>
    );
  }
);

const CreditsComponent: FC<Pick<ICourse, "credits">> = memo(({ credits }) => {
  return (
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
  );
});

export const ReqCircleComponent: FC<Pick<ICourse, "code">> = memo(
  ({ code }) => {
    const config = useContext(ConfigContext);
    const [activeRequisites] = useActiveRequisites({ code });
    const [activeFlow] = useActiveFlow({ code });

    return (
      ((activeFlow || activeRequisites) && (
        <motion.div
          key="req_circle"
          initial={{
            opacity: 0,
            position: "static",
          }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            position: "absolute",
          }}
        >
          <Box mt="-15px" pos="absolute" right="8px" top="80px">
            <svg width={32} height={32}>
              <circle
                r={15}
                cx={16}
                cy={16}
                stroke={
                  activeFlow
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
                  activeFlow
                    ? config.FLOW_CIRCLE_COLOR
                    : config.REQ_CIRCLE_COLOR
                }
              >
                {activeFlow
                  ? config.FLOW_CIRCLE_LABEL
                  : config.REQ_CIRCLE_LABEL}
              </text>
            </svg>
          </Box>
        </motion.div>
      )) ||
      null
    );
  }
);

const GradeComponent: FC<Pick<CurrentTakenData, "state" | "grade">> = memo(
  ({ grade, state }) => {
    const config = useContext(ConfigContext);

    return (
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
    );
  }
);

const HistoricalCirclesComponent: FC<Pick<ICourse, "taken" | "code">> = memo(
  ({ taken, code }) => {
    const config = useContext(ConfigContext);

    return (
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
    );
  }
);

const currentDistributionLabel = ({
  term,
  year,
  label,
}: {
  term: string | number;
  year: number;
  label: string;
}) => {
  return `${label} ${term} ${year}`;
};

const HistogramsComponent: FC<Pick<CurrentTakenData, "state">> = memo(
  ({ children, state }) => {
    const [isPossibleToTake] = useIsPossibleToTakeForeplan({ state });
    return (
      <motion.div
        key="histograms"
        initial={{
          opacity: 0,
          scale: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
          position: "static",
        }}
        exit={{
          opacity: 0,
          scale: 0.4,
          position: "absolute",
        }}
        className={classNames({
          [styles.histogramBox]: true,
          [styles.foreplanActive]: isPossibleToTake,
        })}
      >
        {children}
      </motion.div>
    );
  }
);

const HistogramNow: FC<Pick<ICourse, "taken" | "bandColors"> &
  Pick<
    CurrentTakenData,
    "currentDistribution" | "term" | "year" | "grade"
  >> = memo(({ currentDistribution, term, year, taken, grade, bandColors }) => {
  const { GRADES_LABEL: label } = useContext(ConfigContext);

  return (
    (currentDistribution &&
      some(currentDistribution, ({ value }) => value) &&
      term &&
      year && (
        <Histogram
          key="now"
          label={currentDistributionLabel({
            term: termTypeToNumber(term),
            year,
            label,
          })}
          distribution={currentDistribution}
          grade={grade}
          bandColors={taken?.[0]?.bandColors ?? bandColors}
        />
      )) ||
    null
  );
});

const HistogramHistoric: FC<Pick<
  ICourse,
  "historicDistribution" | "bandColors"
> &
  Pick<CurrentTakenData, "grade">> = memo(
  ({ historicDistribution, bandColors, grade }) => {
    const config = useContext(ConfigContext);
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
  }
);

export const CourseBox: FC<ICourse> = ({
  code,
  name,
  credits,
  historicDistribution,
  taken,
  bandColors,
  requisites,
  flow,
}) => {
  const config = useContext(ConfigContext);

  const { semestersTaken } = useMemo(() => {
    const semestersTaken = taken.map(({ term, year }) => {
      return { term, year };
    });

    return { semestersTaken };
  }, [taken]);

  const [activeCourse] = useActiveCourse({ code });
  const [activeFlow] = useActiveFlow({ code });
  const [activeRequisites] = useActiveRequisites({ code });
  const [explicitSemester] = useCheckExplicitSemester({
    semestersTaken,
  });

  const { user } = useUser({
    fetchPolicy: "cache-only",
  });

  const {
    state,
    grade,
    registration,
    currentDistribution,
    term,
    year,
    parallelGroup,
  } = useMemo<Partial<ITakenCourse>>(() => {
    if (explicitSemester) {
      const foundData = taken.find(({ term, year }) => {
        return pairTermYear(term, year) === explicitSemester;
      });
      return foundData || {};
    }
    return taken[0] || {};
  }, [semestersTaken, explicitSemester, taken]);

  const [isOpen] = useDashboardIsCourseOpen({
    code,
  });

  const isFutureCourseFulfilled = useIsCourseFuturePlanificationFulfilled({
    state: taken[0]?.state,
    code,
  });

  const [isPossibleToTakeForeplan] = useIsPossibleToTakeForeplan({
    state: taken[0]?.state,
  });

  const borderColor = useMemo(() => {
    if (activeCourse) {
      return config.ACTIVE_COURSE_BOX_COLOR;
    }

    if (isFutureCourseFulfilled) {
      return config.FOREPLAN_COURSE_FUTURE_PLANIFICATION_FULFILLED_BORDER_COLOR;
    }

    if (activeFlow) {
      return config.FLOW_COURSE_BOX_COLOR;
    }
    if (activeRequisites) {
      return config.REQUISITE_COURSE_BOX_COLOR;
    }
    if (explicitSemester) {
      return config.EXPLICIT_SEMESTER_COURSE_BOX_COLOR;
    }
    return config.INACTIVE_COURSE_BOX_COLOR;
  }, [
    activeCourse,
    activeRequisites,
    activeFlow,
    explicitSemester,
    config,
    code,
    isFutureCourseFulfilled,
    user,
  ]);

  return (
    <OuterCourseBox
      code={code}
      currentDistribution={currentDistribution}
      historicDistribution={historicDistribution}
      isOpen={isOpen}
      semestersTaken={semestersTaken}
      borderColor={borderColor}
      isFutureCourseFulfilled={isFutureCourseFulfilled}
    >
      <MainBlockOuter
        flow={flow}
        requisites={requisites}
        code={code}
        semestersTaken={semestersTaken}
      >
        <NameComponent
          code={code}
          taken={taken}
          name={name}
          isOpen={isOpen}
          parallelGroup={parallelGroup}
        />

        <AnimatePresence>
          {registration && isOpen && (
            <RegistrationComponent
              key="registration"
              registration={registration}
            />
          )}
          {!isOpen && <CreditsComponent key="credits" credits={credits} />}

          <ReqCircleComponent key="reqCircle" code={code} />

          {isOpen && (
            <HistogramsComponent
              key="histogramsComponent"
              state={taken[0]?.state}
            >
              <HistogramNow
                taken={taken}
                bandColors={bandColors}
                currentDistribution={currentDistribution}
                term={term}
                year={year}
                grade={grade}
              />
              <HistogramHistoric
                historicDistribution={historicDistribution}
                bandColors={bandColors}
                grade={grade}
              />
            </HistogramsComponent>
          )}
          {isPossibleToTakeForeplan && user?.config.FOREPLAN_COURSE_STATS && (
            <ForeplanCourseStats key="foreplanCourseStats" code={code} />
          )}
        </AnimatePresence>
      </MainBlockOuter>
      <SecondaryBlockOuter
        taken={taken}
        bandColors={bandColors}
        borderColor={borderColor}
        grade={grade}
        state={state}
      >
        {grade !== undefined && <GradeComponent grade={grade} state={state} />}

        {taken.length > 1 && (
          <HistoricalCirclesComponent code={code} taken={taken} />
        )}
        <AnimatePresence>
          {isPossibleToTakeForeplan && user?.config.FOREPLAN && (
            <ForeplanCourseCheckbox
              key="foreplanCourseCheckbox"
              code={code}
              credits={credits}
              name={name}
            />
          )}
        </AnimatePresence>
      </SecondaryBlockOuter>
    </OuterCourseBox>
  );
};
