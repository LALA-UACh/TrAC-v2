import { scaleLinear } from "d3-scale";
import { AnimatePresence, motion } from "framer-motion";
import { some } from "lodash";
import { reverse } from "lodash/fp";
import {
    cloneElement, createContext, FC, ReactElement, ReactNode, SVGProps, useCallback, useContext,
    useMemo, useState
} from "react";
import { useSetState, useUpdateEffect } from "react-use";
import pixelWidth from "string-pixel-width";

import { Box, Flex, Stack, Text } from "@chakra-ui/core";
import { RequireAuth } from "@components";
import {
    DROPOUT_PREDICTION, DROPOUT_PREDICTION_ACCURACY, DROPOUT_PREDICTION_DESCRIPTION, GRADES_SCALES,
    HISTORIC_GRADES, PROGRAM_PGA
} from "@constants";
import data from "@constants/data.json";
import { AxisBottom, AxisLeft } from "@vx/axis";

type ISemesterTaken = { year: number; semester: string };

const CoursesFlowContext = createContext<{
  active?: string;
  flow?: Record<string, boolean>;
  requisites?: Record<string, boolean>;
  semestersTaken: ISemesterTaken[];
  explicitSemester?: string;
  checkExplicitSemester: (
    semestersTaken: { year: number; semester: string }[]
  ) => boolean;
  toggleExplicitSemester: (year: number, semester: string) => void;
  add: (data: {
    course: string;
    flow: string[];
    requisites: string[];
    semestersTaken: ISemesterTaken[];
  }) => void;
  remove: (course: string) => void;
}>({
  add: () => {},
  remove: () => {},
  checkExplicitSemester: () => false,
  toggleExplicitSemester: () => {},
  semestersTaken: []
});

const CoursesFlow = ({ children }: { children: ReactNode }) => {
  const [explicitSemester, setExplicitSemester] = useState<
    string | undefined
  >();
  const checkExplicitSemester = useCallback(
    (semestersTaken: { year: number; semester: string }[]) => {
      return (
        !!explicitSemester &&
        !!semestersTaken.find(
          val => `${val.semester}${val.year}` === explicitSemester
        )
      );
    },
    [explicitSemester]
  );
  const toggleExplicitSemester = useCallback(
    (year: number, semester: string) => {
      setExplicitSemester(value => {
        const pair = `${semester}${year}`;
        if (value !== pair) return pair;
        return undefined;
      });
    },
    [setExplicitSemester]
  );

  // ONLY ACTIVE[0] IS SHOWN AS ACTIVE
  // AL THE REST WORKS AS HISTORY
  const [{ active, flow, requisites, semestersTaken }, setState] = useSetState<{
    active: string[];
    semestersTaken: ISemesterTaken[][];
    flow: Record<string, boolean>[];
    requisites: Record<string, boolean>[];
  }>({ active: [], flow: [], requisites: [], semestersTaken: [] });

  const add = useCallback(
    ({
      course,
      flow,
      requisites,
      semestersTaken
    }: {
      course: string;
      flow: string[];
      requisites: string[];
      semestersTaken: { year: number; semester: string }[];
    }) => {
      // ADD MEANS: THE NEW COURSE, FLOW AND REQUISITES HAVE TO BE PUT AT THE VERY BEGINNING
      setState(state => {
        state.active = [course, ...state.active];
        state.flow = [
          flow.reduce<Record<string, boolean>>(
            (ac, v) => ({ ...ac, [v]: true }),
            {}
          ),
          ...state.flow
        ];
        state.requisites = [
          requisites.reduce<Record<string, boolean>>(
            (ac, v) => ({ ...ac, [v]: true }),
            {}
          ),
          ...state.requisites
        ];
        state.semestersTaken = [semestersTaken, ...state.semestersTaken];

        if (!checkExplicitSemester(semestersTaken)) {
          setExplicitSemester(undefined);
        }

        return state;
      });
    },
    [setState, setExplicitSemester, explicitSemester, checkExplicitSemester]
  );
  const remove = useCallback(
    (course: string) => {
      // REMOVE MEANS: IF THE COURSE IS FOUND, REMOVE IT FROM THE ACTIVE ARRAY AND FOLLOWS IT'S INDEX TO REMOVE THE CORRESPONDING DATA FROM FLOWREF AND REQUISITESREF
      setState(state => {
        const indexToRemove = state.active.findIndex(
          activeCourse => activeCourse === course
        );
        if (indexToRemove !== -1) {
          state.active.splice(indexToRemove, 1);
          state.flow.splice(indexToRemove, 1);
          state.requisites.splice(indexToRemove, 1);
          state.semestersTaken.splice(indexToRemove, 1);
        }

        return state;
      });
    },
    [setState, setExplicitSemester, explicitSemester, checkExplicitSemester]
  );

  return (
    <CoursesFlowContext.Provider
      value={{
        active: active[0],
        flow: flow[0],
        requisites: requisites[0],
        semestersTaken: semestersTaken[0],
        add,
        remove,
        checkExplicitSemester,
        toggleExplicitSemester,
        explicitSemester
      }}
    >
      {children}
    </CoursesFlowContext.Provider>
  );
};

enum State {
  Approved = "A",
  Reapproved = "R",
  Current = "C",
  Canceled = "N",
  Pending = "P"
}
console.log("data", data);
const SingleBar: FC<SVGProps<SVGRectElement> & {
  grey?: boolean;
  y?: number;
  height?: number;
}> = ({ grey, y, height, ...rest }) => {
  return (
    <rect
      width={40}
      y={(y ?? 0) - (height ?? 0)}
      height={height}
      fill={grey ? "rgb(122,122,122)" : "rgb(191,191,191)"}
      {...rest}
    />
  );
};

const rangeGrades = [
  { min: 1, max: 3.5, color: "#d6604d" },
  { min: 3.5, max: 4, color: "#f48873" },
  { min: 4, max: 4.5, color: "#a7dc78" },
  { min: 4.5, max: 7, color: "#66b43e" }
];
const approvedGrade: number = 4;

const minGrade = Math.min(...rangeGrades.map(({ min }) => min));
const maxGrade = Math.max(...rangeGrades.map(({ max }) => max));
const scaleAxisX = scaleLinear()
  .range([minGrade, 250])
  .domain([minGrade, maxGrade]);

const scaleColorX = scaleLinear()
  .range([0, 250])
  .domain([minGrade, maxGrade]);

const approvedColorScale = scaleLinear()
  .range(["#b0ffa1" as any, "#5bff3b" as any])
  .domain([approvedGrade, maxGrade]);
const reapprovedColorScale = scaleLinear()
  .range(["#ff4040" as any, "#ff8282" as any])
  .domain([minGrade, approvedGrade]);

const XAxis: FC = () => {
  const AxisColor = useMemo(
    () =>
      rangeGrades.map(({ min, max, color }, key) => (
        <rect
          key={key}
          x={5 + scaleColorX(min)}
          y={80}
          width={scaleColorX(max) - scaleColorX(min)}
          height={7}
          fill={color}
        />
      )),
    [rangeGrades, scaleColorX]
  );

  const AxisNumbers = useMemo(
    () => (
      <AxisBottom
        scale={scaleAxisX}
        left={5}
        top={80}
        hideAxisLine={true}
        hideTicks={true}
        tickLength={4}
        numTicks={5}
        tickFormat={(n: number) => {
          if (n.toString(10).slice(-2) === ".0") {
            return n.toString(10).slice(0, -2);
          }
          return n;
        }}
      />
    ),
    [scaleAxisX]
  );

  return (
    <>
      {AxisColor}
      {AxisNumbers}
    </>
  );
};

const Histogram: FC<{ distribution: number[]; label?: string }> = ({
  distribution,
  label
}) => {
  const barsScale = useCallback(
    scaleLinear()
      .domain([0, Math.max(...distribution)])
      .range([0, 70]),
    [distribution]
  );
  const axisLeftScale = useCallback(
    scaleLinear()
      .range([0, 70])
      .domain([Math.max(...distribution), 0]),
    [distribution]
  );

  return (
    <svg width={300} height={130}>
      <svg x={35} y={23}>
        <XAxis />
        {distribution.map((n, key) => (
          <SingleBar
            x={5 + 40 * key + 2 * key}
            y={77}
            key={key}
            grey={key === 1}
            height={barsScale(n)}
          />
        ))}
      </svg>

      <svg x={0}>
        <text y={20} x={30} fontWeight="bold">
          {label ?? "Undefined"}
        </text>
        <svg x={-5} y={20}>
          <AxisLeft
            left={40}
            top={10}
            scale={axisLeftScale}
            hideAxisLine={true}
            tickLength={4}
            numTicks={4}
          />
        </svg>
      </svg>
    </svg>
  );
};

const CourseBox: FC<{
  name: string;
  code: string;
  credits: number;
  requisites: string[];
  flow: string[];
  historicDistribution?: number[];
  currentDistribution?: number[];
  registration?: string;
  grade?: number;
  currentDistributionLabel?: string;
  historicalStates?: { state: State; grade: number }[];
  state?: State;
  semestersTaken: { year: number; semester: string }[];
}> = ({
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
      case State.Approved:
        return (approvedColorScale(grade || maxGrade) as unknown) as string;
      case State.Reapproved:
        return (reapprovedColorScale(grade || minGrade) as unknown) as string;
      case State.Current:
        return "blue";
      case State.Canceled:
        return "white";
      default:
        return "transparent";
    }
  }, [state]);

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
  }, [active]);
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
  }, [active, code, explicitSemester, checkExplicitSemester, semestersTaken]);

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
        setMax(!max);
      }}
      className="unselectable"
    >
      <Flex w="100%" h="100%" pt={2} pl={2} pos="relative">
        <Stack spacing={1}>
          <Text>
            <b>{code}</b>
          </Text>
          <Text fontSize={9} maxWidth="150px">
            {name}
          </Text>
        </Stack>

        <AnimatePresence>
          {registration && max && (
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
          )}
          {!max && (
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
          )}

          <AnimatePresence>
            {(contextFlow?.[code] || contextRequisites?.[code]) && (
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
                        contextFlow?.[code]
                          ? "rgb(66,153,225)"
                          : "rgb(245,101,101)"
                      }
                      fill="transparent"
                    />
                    <text
                      x={4}
                      y={21}
                      fontWeight="bold"
                      fill={
                        contextFlow?.[code]
                          ? "rgb(66,153,225)"
                          : "rgb(245,101,101)"
                      }
                    >
                      {contextFlow?.[code] ? "Fluj" : "Req"}
                    </text>
                  </svg>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {max && (
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
                />
              )}

              {historicDistribution && (
                <Histogram
                  key="historic"
                  label={HISTORIC_GRADES}
                  distribution={historicDistribution}
                />
              )}
            </motion.div>
          )}
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
        {grade !== undefined && (
          <Text mb={2} pt={1}>
            <b>
              {grade
                ? grade.toFixed(1)
                : (() => {
                    switch (state) {
                      case State.Approved:
                        return "AP";
                      case State.Reapproved:
                        return "RE";
                      case State.Canceled:
                        return "AN";
                      default:
                        return "BUGGED";
                    }
                  })()}
            </b>
          </Text>
        )}

        {some(historicalStates) && (
          <Stack spacing={0.7}>
            {historicalStates?.map(({ state, grade: historicalGrade }, key) => {
              let color: string;
              switch (state) {
                case State.Reapproved:
                  color = (reapprovedColorScale(
                    historicalGrade
                  ) as unknown) as string;
                  break;
                case State.Current:
                  color = "blue";
                  break;
                case State.Canceled:
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
        )}
      </Flex>
    </Flex>
  );
};

type ISemester = Array<{
  name: string;
  code: string;
  credits: number;
  flow: string[];
  requisites: string[];
  historicDistribution?: number[];
  currentDistribution?: number[];
  registration?: string;
  grade?: number;
  state?: State;
  semestersTaken: { year: number; semester: string }[];
}>;

function toRoman(num: number): string {
  if (num < 1) {
    return "";
  }
  if (num >= 40) {
    return "XL" + toRoman(num - 40);
  }
  if (num >= 10) {
    return "X" + toRoman(num - 10);
  }
  if (num >= 9) {
    return "IX" + toRoman(num - 9);
  }
  if (num >= 5) {
    return "V" + toRoman(num - 5);
  }
  if (num >= 4) {
    return "IV" + toRoman(num - 4);
  }
  if (num >= 1) {
    return "I" + toRoman(num - 1);
  }
  return "";
}

const Semester: FC<{ semester: ISemester; n: number }> = ({ semester, n }) => {
  return (
    <Stack>
      <Text color="rgb(70,130,180)" textAlign="center" fontSize="1.5em">
        <b>{toRoman(n)}</b>
      </Text>
      {semester.map((course, key) => (
        <CourseBox key={key} {...course} />
      ))}
    </Stack>
  );
};

const TimeLineTooltip: FC<{
  children: ReactElement;
  grade: number;
}> = ({ children, grade }) => {
  const [show, setShow] = useState(false);
  const rectWidth = useMemo(
    () => pixelWidth(grade.toString(10), { size: 15.5 }) + 1,
    [grade]
  );
  const Children = useMemo(
    () =>
      cloneElement(children, {
        onMouseOver: () => {
          setShow(true);
        },
        onMouseLeave: () => {
          setShow(false);
        }
      }),
    [children, setShow]
  );
  return (
    <g>
      {Children}
      <AnimatePresence>
        {show && (
          <motion.g
            key="tooltip"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <rect
              x={(children.props?.cx ?? children.props?.x ?? 0) + 9}
              y={(children.props?.cy ?? children.props?.y ?? 0) - 20}
              fill={children.props?.fill}
              width={rectWidth}
              height={20}
              rx={5}
            />
            <text
              x={(children.props?.cx ?? children.props?.x ?? 0) + 10}
              y={(children.props?.cy ?? children.props?.y ?? 0) - 5}
              fill="rgb(255,255,255)"
            >
              {grade}
            </text>
          </motion.g>
        )}
      </AnimatePresence>
    </g>
  );
};

const TimeLine: FC<{
  PGA: number[];
  PSP: number[];
  ProgramPGA: number[];
  semestersTaken: { year: number; semester: string }[];
}> = ({ PGA, PSP, ProgramPGA, semestersTaken }) => {
  const YAxisScale = scaleLinear()
    .range([0, 130])
    .domain([maxGrade, minGrade]);
  const GradeScale = scaleLinear()
    .range([40, 170])
    .domain([maxGrade, minGrade]);

  const PSP_COLOR = "rgb(70,130,180)";
  const PGA_COLOR = "rgb(173,66,244)";
  const PROGRAM_PGA_COLOR = "rgb(102,102,102)";

  const width = Math.max((PGA.length - 1) * 120 + 60, 650);
  const height = 270;
  const scale = 0.7;
  const { explicitSemester } = useContext(CoursesFlowContext);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width * scale} ${height * scale}`}
    >
      <text y={20} x={10} fontSize="1em" fontWeight="bold">
        {GRADES_SCALES}
      </text>
      <AxisLeft
        scale={YAxisScale}
        left={40}
        top={40}
        hideAxisLine={false}
        tickLength={4}
        numTicks={5}
      />
      <line
        x1={39}
        y1={170}
        x2={PGA.length * 100 + 160}
        y2={40 + 130}
        stroke="black"
      />
      <line
        x1={39}
        y1={GradeScale(approvedGrade)}
        x2={340}
        y2={GradeScale(approvedGrade)}
        stroke="black"
        strokeDasharray="2"
      />

      <circle cx={150} cy={12} r={5} fill={PSP_COLOR} />

      <text x={160} y={20}>
        PSP
      </text>
      <circle cx={250} cy={12} r={5} fill={PGA_COLOR} />
      <text x={260} y={20}>
        PGA
      </text>
      <circle cx={350} cy={12} r={5} fill={PROGRAM_PGA_COLOR} />
      <text x={360} y={20}>
        {PROGRAM_PGA}
      </text>

      {new Array(PGA.length).fill(0).map((_, key) => {
        return (
          <g key={key}>
            {PSP[key + 1] !== undefined && (
              <line
                stroke={PSP_COLOR}
                x1={key * 70 + 70}
                y1={GradeScale(PSP[key])}
                x2={(key + 1) * 70 + 70}
                y2={GradeScale(PSP[key + 1])}
              />
            )}
            {PGA[key + 1] !== undefined && (
              <line
                stroke={PGA_COLOR}
                x1={key * 70 + 70}
                y1={GradeScale(PGA[key])}
                x2={(key + 1) * 70 + 70}
                y2={GradeScale(PGA[key + 1])}
              />
            )}
            {ProgramPGA[key + 1] !== undefined && (
              <line
                stroke={PROGRAM_PGA_COLOR}
                x1={key * 70 + 70}
                y1={GradeScale(ProgramPGA[key])}
                x2={(key + 1) * 70 + 70}
                y2={GradeScale(ProgramPGA[key + 1])}
              />
            )}
          </g>
        );
      })}
      {new Array(PGA.length).fill(0).map((_, key) => {
        return (
          <g key={key}>
            <TimeLineTooltip grade={PGA[key]}>
              <circle
                cy={GradeScale(PGA[key])}
                cx={key * 70 + 70}
                r={5}
                fill={PGA_COLOR}
              />
            </TimeLineTooltip>
            <TimeLineTooltip grade={ProgramPGA[key]}>
              <circle
                cy={GradeScale(ProgramPGA[key])}
                cx={key * 70 + 70}
                r={5}
                fill={PROGRAM_PGA_COLOR}
              />
            </TimeLineTooltip>
            <TimeLineTooltip grade={PSP[key]}>
              <circle
                cy={GradeScale(PSP[key])}
                cx={key * 70 + 70}
                r={5}
                fill={
                  `${semestersTaken[key].semester}${semestersTaken[key].year}` ===
                  explicitSemester
                    ? "rgb(236,201,75)"
                    : PSP_COLOR
                }
                style={{ transition: "0.5s all ease-in-out" }}
              />
            </TimeLineTooltip>
          </g>
        );
      })}
    </svg>
  );
};

const Dropout: FC = () => {
  const [show, setShow] = useState(true);

  return (
    <Flex alignItems="center">
      <Flex
        backgroundColor="rgb(252,249,165)"
        boxShadow={
          show
            ? "0px 0px 2px 1px rgb(174,174,174)"
            : "2px 3px 2px 1px rgb(174,174,174)"
        }
        borderRadius={show ? "5px 5px 5px 5px" : "0px 5px 5px 0px"}
        alignItems="center"
        onClick={() => setShow(show => !show)}
        cursor="pointer"
        transition="0.5s box-shadow ease-in-out"
      >
        <Stack
          className="unselectable"
          isInline
          pt={10}
          pb={10}
          minHeight="120px"
        >
          <Text
            minHeight="120px"
            m={0}
            ml={4}
            textAlign="center"
            fontWeight="bold"
            className="verticalText"
            fontSize="1.2em"
          >
            {DROPOUT_PREDICTION}
          </Text>
          <AnimatePresence>
            {show && (
              <motion.div
                key="dropout-text"
                initial={{
                  opacity: 0
                }}
                animate={{ opacity: 1 }}
                exit={{
                  opacity: 0
                }}
              >
                <Text width="290px" pl={5} pb={0} mb={0}>
                  {DROPOUT_PREDICTION_DESCRIPTION}
                </Text>
                <Text fontSize="2.5em" fontWeight="bold" ml={5} mb={0}>
                  {data.prediction_data.prob_dropout}%
                </Text>
                <Text ml={5}>
                  ({DROPOUT_PREDICTION_ACCURACY}{" "}
                  <b>{data.prediction_data.model_accuracy}</b>)
                </Text>
              </motion.div>
            )}
          </AnimatePresence>
        </Stack>
      </Flex>
    </Flex>
  );
};

const SemesterTakenBox: FC<{ year: number; semester: string }> = ({
  year,
  semester
}) => {
  const {
    toggleExplicitSemester,
    semestersTaken,
    explicitSemester
  } = useContext(CoursesFlowContext);
  return (
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
      transition="0.5s all ease-in-out"
      onClick={() => {
        toggleExplicitSemester(year, semester);
      }}
    >
      <b>{`${semester}S ${year}`}</b>
    </Box>
  );
};

export default () => {
  let semestersTaken = data.studentAcademic.terms.map(({ year, semester }) => ({
    year,
    semester
  }));
  let semesters: {
    semester: ISemester;
  }[] = [];
  data.programStructure.terms.map(
    ({
      courses
    }: {
      courses: {
        code: string;
        name: string;
        credits: number;
        historicGroup: {
          distribution: Array<{ label: string; value: number }>;
        } | null;
        flujoMaterias: string[];
        requisites: string[];
      }[];
    }) => {
      semesters.push({
        semester: courses.map(
          ({
            code,
            name,
            credits,
            historicGroup,
            flujoMaterias,
            requisites
          }) => {
            const values = historicGroup?.distribution.map(
              ({ value }) => value
            );
            let registration: string | undefined;
            let grade: number | undefined;
            let currentDistributionLabel: string | undefined;
            let currentDistribution: number[] | undefined;
            let first: boolean = true;
            let historicalStates: { state: State; grade: number }[] = [];
            let state: State | undefined;
            const semestersTaken: { year: number; semester: string }[] = [];

            reverse(data.studentAcademic.terms).forEach(({ coursesTaken }) => {
              for (const {
                code: codeToFind,
                classGroup: { year, semester, distribution },
                registration: registrationToFind,
                grade: gradeToFind,
                state: stateToFind
              } of coursesTaken) {
                const values = distribution.map(({ value }) => value);

                if (codeToFind === code) {
                  if (first) {
                    first = false;
                    registration = registrationToFind;
                    grade = gradeToFind;
                    currentDistributionLabel = `Calificaciones ${semester} ${year}`;
                    state = stateToFind as State;
                    if (some(values)) {
                      currentDistribution = values;
                    }
                  } else {
                    historicalStates.push({
                      state: stateToFind as State,
                      grade: gradeToFind
                    });
                  }
                  semestersTaken.push({ year, semester });
                }
              }
            });
            return {
              name,
              code,
              credits,
              historicDistribution: some(values) ? values : [],
              registration,
              grade,
              currentDistributionLabel,
              currentDistribution,
              historicalStates,
              state,
              flow: flujoMaterias,
              requisites,
              semestersTaken
            };
          }
        )
      });
    }
  );

  return (
    <RequireAuth>
      <CoursesFlow>
        <Box pb={50} width="100vw" backgroundColor="black" />
        <Stack isInline>
          <Box>
            <TimeLine
              PGA={data.PGA}
              PSP={data.PSP}
              ProgramPGA={data.ProgramPGA}
              semestersTaken={semestersTaken}
            />
          </Box>
          <Dropout />
        </Stack>

        <Stack isInline pl="50px">
          {semestersTaken.map(({ semester, year }, key) => (
            <SemesterTakenBox key={key} semester={semester} year={year} />
          ))}
        </Stack>
        <Stack isInline spacing={8}>
          {semesters.map(({ semester }, key) => (
            <Semester key={key} semester={semester} n={key + 1} />
          ))}
        </Stack>
      </CoursesFlow>
    </RequireAuth>
  );
};
