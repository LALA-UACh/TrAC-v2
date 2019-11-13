import { scaleLinear } from "d3-scale";
import { AnimatePresence, motion } from "framer-motion";
import { FC, SVGProps, useState } from "react";
import { FaCircle } from "react-icons/fa";

import { Box, Flex, Stack, Text } from "@chakra-ui/core";
import { RequireAuth } from "@componentes";
import data from "@constants/data.json";
import { AxisLeft } from "@vx/axis";

console.log("data", data);
const SingleBar: FC<SVGProps<SVGRectElement> & {
  taken?: boolean;
  y?: number;
  height?: number;
}> = ({ taken, y, height, ...rest }) => {
  return (
    <rect
      {...rest}
      width={40}
      y={(y ?? 0) - (height ?? 0)}
      height={height}
      fill={taken ? "rgb(122,122,122)" : "rgb(191,191,191)"}
    />
  );
};

const XAxis: FC = () => {
  return (
    <>
      <rect x={0 + 5} y={80} width={105} height={7} fill="rgb(214,96,77)" />
      <text x={0 + 2} y={98} fontSize="0.8em">
        1
      </text>
      <text x={43} y={98} fontSize="0.8em">
        2
      </text>
      <text x={85} y={98} fontSize="0.8em">
        3
      </text>
      <text x={128} y={98} fontSize="0.8em">
        4
      </text>
      <text x={170} y={98} fontSize="0.8em">
        5
      </text>
      <text x={210} y={98} fontSize="0.8em">
        6
      </text>
      <text x={254} y={98} fontSize="0.8em">
        7
      </text>
      <rect x={105 + 5} y={80} width={22} height={7} fill="rgb(244,136,115)" />

      <rect x={127 + 5} y={80} width={22} height={7} fill="rgb(167,220,120)" />
      <rect x={149 + 5} y={80} width={102} height={7} fill="rgb(102,180,62)" />
    </>
  );
};

const Histogram: FC<{ distribution: number[] }> = ({ distribution }) => {
  const scale = scaleLinear()
    .domain([0, Math.max(...distribution)])
    .range([0, 70]);

  return (
    <svg width={300} height={130}>
      <svg x={35} y={23}>
        <XAxis />
        {distribution.map((n, key) => (
          <SingleBar
            x={5 + 40 * key + 2 * key}
            y={77}
            key={key}
            taken={key === 1}
            height={scale(n)}
          />
        ))}
        {/* <SingleBar x={5} y={77} height={10} />
        <SingleBar x={40 + 5 + 2} y={77} height={30} />
        <SingleBar x={80 + 5 + 4} y={77} height={10} />
        <SingleBar x={120 + 5 + 6} y={77} height={70} />
        <SingleBar x={160 + 5 + 8} y={77} height={60} taken />
        <SingleBar x={200 + 5 + 10} y={77} height={30} /> */}
      </svg>

      <svg x={0}>
        <text y={20} x={30} fontWeight="bold">
          Calificaciones 1 2015
        </text>
        <svg x={-5} y={40}>
          <AxisLeft
            label="hello"
            left={40}
            top={10}
            scale={scaleLinear()
              .range([0, 50])
              .domain([0, Math.max(...distribution)].reverse())}
            hideAxisLine={true}
            tickLength={4}
            numTicks={4}
            // tickFormat={d => d + "%"}
          />
        </svg>
        {/* {scale.ticks(3).map((n, key) => (
          <text key={key} x={0} y={42 + key * 12} fontSize="0.8em">
            {`${n} -`}
          </text>
        ))} */}
        {/* <text x={0} y={42} fontSize="0.8em">
          2,500 -
        </text>
        <text x={0} y={54} fontSize="0.8em">
          2,000 -
        </text>
        <text x={0} y={66} fontSize="0.8em">
          1,500 -
        </text>
        <text x={0} y={78} fontSize="0.8em">
          1,000 -
        </text>
        <text
          width={200}
          x={0}
          y={90}
          fontSize="0.8em"
          style={{ whiteSpace: "pre" }}
        >
          {"    500 -"}
        </text> */}
      </svg>
    </svg>
  );
};

const CourseBox: FC<{
  name: string;
  code: string;
  credits: number;
  historicDistribution: number[];
  currentDistribution?: number[];
  registration?: string;
  grade?: number;
}> = ({
  name,
  code,
  credits,
  historicDistribution,
  currentDistribution,
  registration,
  grade
}) => {
  const [max, setMax] = useState(true);

  return (
    <Flex
      m={1}
      color="black"
      bg="rgb(245,245,245)"
      w={max ? 350 : 180}
      h={max ? (registration ? 350 : 350 - 130) : 120}
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
                transitionDuration: "0.7s",
                transitionDelay: "0.05s",
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
                <Histogram key="now" distribution={currentDistribution} />
              )}

              <Histogram key="historic" distribution={historicDistribution} />
            </motion.div>
          )}
        </AnimatePresence>
      </Flex>
      <Flex
        w="40px"
        mt="-0.5px"
        h="100.5%"
        // h={max ? 347 : 117}
        bg="rgb(117,187,81)"
        direction="column"
        alignItems="center"
        borderRadius="0px 2px 2px 0px"
        mr="-0.5px"
        zIndex={0}
        transition="0.5s height ease-in-out"
      >
        {grade && (
          <Text mb={2} pt={1}>
            <b>{grade}</b>
          </Text>
        )}

        {grade && (
          <Stack spacing={0.7}>
            {new Array(3).fill(0).map((_, k) => (
              <Box
                key={k}
                as={FaCircle}
                m={0}
                p={0}
                paddingBottom={1}
                size="16px"
                color="rgb(250,50,100)"
              />
            ))}
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
  historicDistribution: number[];
  currentDistribution?: number[];
  registration?: string;
  grade?: number;
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
/**
 * name: string;
  code: string;
  credits: number;
  historicDistribution: number[];
  currentDistribution?: number[];
  registration?:string;
  grade?:number;
 */

export default () => {
  let semesters: ISemester[] = [];
  data.programStructure.terms.map(
    ({
      courses
    }: {
      courses: Array<{
        code: string;
        name: string;
        credits: number;
        historicGroup: {
          distribution: Array<{ label: string; value: number }>;
        } & any;
      }>;
    }) => {
      semesters.push(
        courses.map(({ code, name, credits, historicGroup }) => {
          return {
            name,
            code,
            credits,
            historicDistribution: historicGroup
              ? (historicGroup as {
                  distribution: { value: number }[];
                }).distribution.map(({ value }) => value)
              : []
          };
        })
      );
    }
  );
  // data.studentAcademic.terms.map(({ coursesTaken }) => {});
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
