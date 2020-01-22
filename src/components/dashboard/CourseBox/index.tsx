import classNames from "classnames";
import { scaleLinear } from "d3-scale";
import { AnimatePresence, motion } from "framer-motion";
import { random, range, some, truncate } from "lodash";
import React, {
  Dispatch,
  FC,
  memo,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";
import ReactTooltip from "react-tooltip";
import { useDebounce, useUpdateEffect } from "react-use";
import { Checkbox } from "semantic-ui-react";

import { Badge, Box, Flex, Stack, Text } from "@chakra-ui/core";

import { StateCourse, termTypeToNumber } from "../../../../constants";
import { ICourse, ITakenCourse, ITakenSemester } from "../../../../interfaces";
import { useUser } from "../../../utils/useUser";
import { ConfigContext } from "../../Config";
import { useForeplanData } from "../../foreplan/ForeplanContext";
import { useTracking } from "../../Tracking";
import {
  useActiveCourse,
  useActiveFlow,
  useActiveRequisites,
  useCoursesDashboardData,
  useExplicitSemester,
} from "../CoursesDashboardContext";
import { Histogram } from "../Histogram";
import styles from "./index.module.css";

export const passColorScale = scaleLinear<string, number>();

export const failColorScale = scaleLinear<string, number>();

export const failRateColorScalePositive = scaleLinear<string, number>();

export const failRateColorScaleNegative = scaleLinear<string, number>();

export interface OpenState {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export type CurrentTakenData = Partial<ITakenCourse>;

const OuterCourseBox: FC<ICourse &
  OpenState & {
    borderColor: string;
    semestersTaken: ITakenSemester[];
  }> = memo(
  ({
    children,
    code,
    taken,
    historicDistribution,
    semestersTaken,
    borderColor,
    open,
    setOpen,
    flow,
    requisites,
  }) => {
    const config = useContext(ConfigContext);

    const [, { track }] = useTracking();
    const [activeCourse, { addCourse, removeCourse }] = useActiveCourse();
    const [activeRequisites] = useActiveRequisites();
    const [activeFlow] = useActiveFlow();
    const [explicitSemester, { checkExplicitSemester }] = useExplicitSemester();

    const opacity = useMemo(() => {
      if (activeCourse) {
        if (
          activeCourse === code ||
          activeFlow?.[code] ||
          activeRequisites?.[code]
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
    }, [code, activeCourse]);

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
            effect: `${open ? "close" : "open"}-course-box`,
          });
        }}
        className="unselectable courseBox"
      >
        {children}
      </Flex>
    );
  }
);

const MainBlockOuter: FC = memo(({ children }) => {
  return (
    <Flex w="100%" h="100%" pt={2} pl={2} pos="relative" className="mainBlock">
      {children}
    </Flex>
  );
});

const NameComponent: FC<ICourse &
  Pick<OpenState, "open"> &
  Pick<CurrentTakenData, "parallelGroup">> = memo(
  ({ code, name, taken, parallelGroup }) => {
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

        <Text fontSize={9} maxWidth="150px">
          {truncate(name, { length: open ? 60 : 35 })}
        </Text>
      </Stack>
    );
  }
);

const SecondaryBlockOuter: FC<ICourse &
  Pick<CurrentTakenData, "grade" | "state"> & {
    borderColor: string;
  }> = memo(({ children, taken, bandColors, borderColor, state, grade }) => {
  const config = useContext(ConfigContext);

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

  return (
    <Flex
      mr="-0.5px"
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

const HistogramsComponent: FC = memo(({ children }) => {
  const [{ active }] = useForeplanData();
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
      }}
      exit={{
        opacity: 0,
        scale: 0.4,
      }}
      className={classNames({
        [styles.histogramBox]: true,
        [styles.foreplanActive]: active,
      })}
    >
      {children}
    </motion.div>
  );
});

export const ReqCircleComponent: FC<Pick<ICourse, "code">> = memo(
  ({ code }) => {
    const config = useContext(ConfigContext);
    const [activeRequisites] = useActiveRequisites();
    const [activeFlow] = useActiveFlow();

    return (
      <>
        {(activeFlow?.[code] || activeRequisites?.[code]) && (
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
            <Box mt="-15px" pos="absolute" right="8px" top="80px">
              <svg width={32} height={32}>
                <circle
                  r={15}
                  cx={16}
                  cy={16}
                  stroke={
                    activeFlow?.[code]
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
                    activeFlow?.[code]
                      ? config.FLOW_CIRCLE_COLOR
                      : config.REQ_CIRCLE_COLOR
                  }
                >
                  {activeFlow?.[code]
                    ? config.FLOW_CIRCLE_LABEL
                    : config.REQ_CIRCLE_LABEL}
                </text>
              </svg>
            </Box>
          </motion.div>
        )}
      </>
    );
  }
);

const ForeplanCourseStats: FC<Pick<ICourse, "code">> = memo(({ code }) => {
  const randomFailRate = Math.random(); //TODO: Use real data

  const fillColor =
    randomFailRate >= 0.3
      ? ((failRateColorScaleNegative(randomFailRate) as unknown) as string)
      : ((failRateColorScalePositive(randomFailRate) as unknown) as string);

  const { user } = useUser();

  return (
    <motion.div
      key="foreplanCourseStats"
      initial={{
        opacity: 0,
      }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
      }}
      className={styles.foreplanCourseStats}
    >
      {user?.config.FOREPLAN_COURSE_FAIL_RATE_STATS && (
        <svg height="10px" width="10px">
          <rect width="10px" height="10px" fill={fillColor} />
        </svg>
      )}

      {user?.config.FOREPLAN_COURSE_EFFORT_STATS && (
        <svg
          className={styles.foreplanCourseEffortStats}
          height="10px"
          width="20px"
        >
          {range(0, random(1, 5)).map(i => {
            //TODO: Use real data
            return (
              <rect
                key={i}
                height="10px"
                width="1px"
                x={i * 3}
                y={0}
                fill="black"
              />
            );
          })}
        </svg>
      )}
    </motion.div>
  );
});

const ForeplanCourseCheckbox: FC<Pick<ICourse, "code">> = memo(({ code }) => {
  const [
    foreplanCtx,
    { addCourseForeplan, removeCourseForeplan },
  ] = useForeplanData();

  const checked = !!foreplanCtx.foreplanCourses[code];
  return (
    <motion.div
      key="foreplanCourseCheckbox"
      initial={{
        opacity: 0,
      }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
      }}
      className={styles.foreplanCourseCheckbox}
    >
      <Checkbox
        checked={checked}
        onChange={ev => {
          ev.preventDefault();
          ev.stopPropagation();
          if (checked) {
            removeCourseForeplan(code);
          } else {
            addCourseForeplan(code);
          }
        }}
        className={classNames({
          [styles.foreplanCheckboxInput]: true,
          [random(0, 1) === 0 ? styles.direct : styles.indirect]: true, //TODO: Use real data
        })}
      />
    </motion.div>
  );
});

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

const HistogramNow: FC<Pick<ICourse, "taken" | "bandColors"> &
  Pick<
    CurrentTakenData,
    "currentDistribution" | "term" | "year" | "grade"
  >> = memo(({ currentDistribution, term, year, taken, grade, bandColors }) => {
  const { GRADES_LABEL: label } = useContext(ConfigContext);

  return (
    <>
      {currentDistribution &&
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
        )}
    </>
  );
});

const HistogramHistoric: FC<Pick<
  ICourse,
  "historicDistribution" | "bandColors"
> &
  Pick<CurrentTakenData, "grade">> = memo(
  ({ historicDistribution, bandColors, grade }) => {
    const config = useContext(ConfigContext);
    return (
      <>
        {historicDistribution &&
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
        )}
      </>
    );
  }
);

export const CourseBox: FC<ICourse> = ({ children, ...course }) => {
  const { code, credits, historicDistribution, taken, bandColors } = course;
  const config = useContext(ConfigContext);

  const [
    {
      activeCourse,
      flow: contextFlow,
      requisites: contextRequisites,
      explicitSemester,
    },
    { checkExplicitSemester },
  ] = useCoursesDashboardData();
  const [foreplanCtx] = useForeplanData();

  const { user } = useUser({
    fetchPolicy: "cache-only",
  });

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

  const borderColor = useMemo(() => {
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
  }, [activeCourse, code, contextFlow, contextRequisites, explicitSemester]);

  const foreplanPossibleToTake = useMemo(() => {
    if (foreplanCtx.active) {
      switch (state) {
        case undefined:
        case StateCourse.Failed:
        case StateCourse.Canceled: {
          return true;
        }
        default:
      }
    }
    return false;
  }, [foreplanCtx.active, state]);

  return (
    <OuterCourseBox
      {...course}
      open={open}
      setOpen={setOpen}
      semestersTaken={semestersTaken}
      borderColor={borderColor}
    >
      <MainBlockOuter>
        <NameComponent {...course} open={open} parallelGroup={parallelGroup} />

        <AnimatePresence>
          {registration && open && (
            <RegistrationComponent registration={registration} />
          )}
          {!open && <CreditsComponent credits={credits} />}

          <ReqCircleComponent code={code} />

          {open && (
            <HistogramsComponent>
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
          {foreplanPossibleToTake && user?.config.FOREPLAN_COURSE_STATS && (
            <ForeplanCourseStats code={code} />
          )}
        </AnimatePresence>
      </MainBlockOuter>
      <SecondaryBlockOuter
        {...course}
        borderColor={borderColor}
        grade={grade}
        state={state}
      >
        {grade !== undefined && <GradeComponent grade={grade} state={state} />}

        {taken.length > 1 && (
          <HistoricalCirclesComponent code={code} taken={taken} />
        )}
        <AnimatePresence>
          {foreplanPossibleToTake && <ForeplanCourseCheckbox code={code} />}
        </AnimatePresence>
      </SecondaryBlockOuter>
    </OuterCourseBox>
  );
};
