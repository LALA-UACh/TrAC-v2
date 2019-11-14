import { scaleLinear } from "d3-scale";
import { AnimatePresence, motion } from "framer-motion";
import { some } from "lodash";
import { reverse } from "lodash/fp";
import { FC, SVGProps, useCallback, useMemo } from "react";
import { useRememberState } from "use-remember-state";

import { Box, Flex, Stack, Text } from "@chakra-ui/core";
import { RequireAuth } from "@componentes";
import { HISTORIC_GRADES } from "@constants";
import data from "@constants/data.json";
import { AxisBottom, AxisLeft } from "@vx/axis";

enum State {
  Approved = "A",
  Reapproved = "R",
  Current = "C",
  Canceled = "N"
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
      .range([0, 50])
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
        <svg x={-5} y={40}>
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
  historicDistribution?: number[];
  currentDistribution?: number[];
  registration?: string;
  grade?: number;
  currentDistributionLabel?: string;
  historicalStates?: { state: State; grade: number }[];
  state?: State;
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
  state
}) => {
  const [max, setMax] = useRememberState(code, false);

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

  return (
    <Flex
      m={1}
      color="black"
      bg="rgb(245,245,245)"
      w={max ? 350 : 180}
      h={h}
      borderRadius={5}
      border="2px"
      borderColor="gray.400"
      borderWidth="2px"
      cursor="pointer"
      transition="0.5s width ease-in-out, 0.5s height ease-in-out"
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
                <b>{registration}</b> {/*CURSADA */}
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
        borderColor="gray.400"
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
  historicDistribution?: number[];
  currentDistribution?: number[];
  registration?: string;
  grade?: number;
  state?: State;
}>;

const Semester: FC<{ semester: ISemester }> = ({ semester }) => {
  return (
    <Stack>
      {semester.map((course, key) => (
        <CourseBox key={key} {...course} />
      ))}
    </Stack>
  );
};

export default () => {
  let semesters: ISemester[] = [];
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
      }[];
    }) => {
      semesters.push(
        courses.map(({ code, name, credits, historicGroup }) => {
          const values = historicGroup?.distribution.map(({ value }) => value);
          let registration: string | undefined;
          let grade: number | undefined;
          let currentDistributionLabel: string | undefined;
          let currentDistribution: number[] | undefined;
          let first: boolean = true;
          let historicalStates: { state: State; grade: number }[] = [];
          let state: State | undefined;
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
            state
          };
        })
      );
    }
  );

  return (
    <RequireAuth>
      <Stack isInline spacing={8}>
        {semesters.map((semester, key) => (
          <Semester key={key} semester={semester} />
        ))}
      </Stack>
    </RequireAuth>
  );
};
