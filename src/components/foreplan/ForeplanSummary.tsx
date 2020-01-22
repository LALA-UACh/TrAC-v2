import { AnimatePresence, motion } from "framer-motion";
import React, { FC, useMemo } from "react";
import { FaGripLinesVertical } from "react-icons/fa";
import { useWindowSize } from "react-use";
import { useRememberState } from "use-remember-state";

import { Box, Flex, Stack, Text } from "@chakra-ui/core";

import { useForeplanData } from "./ForeplanContext";

const ForeplanSummary: FC = () => {
  const [{ active, foreplanCourses }] = useForeplanData();

  const { height } = useWindowSize();
  const [expanded, setExpanded] = useRememberState(
    "foreplanSummaryExpanded",
    false
  );
  const foreplanCoursesArray = useMemo(() => Object.keys(foreplanCourses), [
    foreplanCourses,
  ]);

  const Summary = useMemo(() => {
    const SummaryTab = (
      <Flex
        dir="column"
        height="100%"
        alignItems="flex-start"
        justifyContent="center"
        m={0}
        cursor="pointer"
        onClick={() => {
          setExpanded(expanded => !expanded);
        }}
        width="2em"
      >
        <AnimatePresence>
          {!expanded && (
            <motion.div
              key={foreplanCoursesArray.length}
              initial={{
                opacity: 0,
                display: "none",
              }}
              animate={{ opacity: 1, display: "block" }}
              exit={{
                opacity: 0,
                display: "none",
              }}
            >
              <Text
                transition="all 1s"
                width="100%"
                textAlign="center"
                fontSize="1.5em"
                fontWeight="bold"
              >
                {foreplanCoursesArray.length}
              </Text>
            </motion.div>
          )}
        </AnimatePresence>

        <Box
          pos="absolute"
          height="100%"
          verticalAlign="middle"
          as={FaGripLinesVertical}
          fontSize="1.3em"
        />
      </Flex>
    );
    return (
      <Flex
        pos={height < 700 ? "fixed" : "absolute"}
        top={height < 700 ? 0 : undefined}
        right={0}
        zIndex={100}
        backgroundColor="#a1ddf7"
        border="1px solid #3b55ff"
        color="black"
        p={0}
        m={1}
        height="18em"
        width="fit-content"
        alignSelf="flex-end"
        justifySelf="flex-end"
        borderRadius="10px"
      >
        {SummaryTab}
        <Stack
          p={expanded ? 3 : 0}
          overflowY={expanded ? "auto" : "hidden"}
          overflowX="hidden"
          width={expanded ? "20em" : "0px"}
          transition="all 0.5s ease-in-out"
        >
          <AnimatePresence>
            {expanded &&
              foreplanCoursesArray.map(course => {
                return (
                  <motion.div
                    key={course}
                    initial={{
                      opacity: 0,
                    }}
                    animate={{ opacity: 1 }}
                    exit={{
                      opacity: 0,
                    }}
                  >
                    {course}
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </Stack>
      </Flex>
    );
  }, [foreplanCoursesArray, expanded, setExpanded, height]);

  return (
    <AnimatePresence>
      {active && foreplanCoursesArray.length > 0 && (
        <motion.div
          key="foreplanSummary"
          initial={{
            opacity: 0,
          }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
          }}
        >
          {Summary}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ForeplanSummary;
