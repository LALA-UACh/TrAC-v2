import { AnimatePresence, motion } from "framer-motion";
import React, { FC, useContext, useMemo } from "react";

import { Box } from "@chakra-ui/core";

import { ForeplanContext } from "./ForeplanContext";

const ForeplanSummary: FC = () => {
  const { active, foreplanCourses } = useContext(ForeplanContext);

  const foreplanCoursesArray = useMemo(() => Object.keys(foreplanCourses), [
    foreplanCourses,
  ]);

  const Summary = useMemo(() => {
    return (
      <Box
        pos="fixed"
        right={0}
        zIndex={100}
        backgroundColor="#a1ddf7"
        border="1px solid #3b55ff"
        color="black"
        p={3}
      >
        <AnimatePresence>
          {foreplanCoursesArray.map(value => {
            return (
              <motion.div
                key={value}
                initial={{
                  opacity: 0,
                }}
                animate={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                }}
              >
                {value}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </Box>
    );
  }, [foreplanCoursesArray]);

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
