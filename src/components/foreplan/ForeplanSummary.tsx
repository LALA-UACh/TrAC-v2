import { AnimatePresence, motion } from "framer-motion";
import { truncate } from "lodash";
import React, {
  Dispatch,
  FC,
  memo,
  SetStateAction,
  useContext,
  useMemo,
} from "react";
import { FaGripLinesVertical } from "react-icons/fa";
import { useWindowSize } from "react-use";
import { useRememberState } from "use-remember-state";

import { Badge, Box, Flex, Stack, Text } from "@chakra-ui/core";

import { ICourse } from "../../../interfaces";
import { useUser } from "../../utils/useUser";
import { ConfigContext } from "../Config";
import {
  useAnyForeplanCourses,
  useForeplanCourseData,
  useForeplanCourses,
  useForeplanCoursesSize,
  useForeplanData,
  useForeplanTotalCreditsTaken,
} from "./ForeplanContext";

interface ExpandedState {
  expanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
}

const OuterSummary: FC = ({ children }) => {
  const { height } = useWindowSize();

  const mobile = useMemo(() => {
    return height < 700;
  }, [height]);

  return (
    <Flex
      pos={mobile ? "fixed" : "absolute"}
      top={mobile ? 0 : undefined}
      right={0}
      zIndex={100}
      backgroundColor="#333333"
      color="white"
      p={0}
      m={1}
      height="23em"
      width="fit-content"
      alignSelf="flex-end"
      justifySelf="flex-end"
      borderRadius="10px"
    >
      {children}
    </Flex>
  );
};

const SummaryTab: FC<ExpandedState> = memo(({ expanded, setExpanded }) => {
  const [nCourses] = useForeplanCoursesSize();

  const NText = useMemo(() => {
    return (
      <motion.div
        key={nCourses}
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
          fontSize={nCourses >= 10 ? "1.2em" : "1.5em"}
          fontWeight="bold"
        >
          {nCourses}
        </Text>
      </motion.div>
    );
  }, [nCourses]);

  return (
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
      <AnimatePresence>{!expanded && NText}</AnimatePresence>

      <Box
        pos="absolute"
        height="100%"
        verticalAlign="middle"
        as={FaGripLinesVertical}
        fontSize="1.3em"
        color="#888"
      />
    </Flex>
  );
});

const ForeplanContentRowListItem: FC<Pick<ICourse, "code">> = memo(
  ({ code }) => {
    const [data] = useForeplanCourseData({ code });

    return (
      <Flex
        width="100%"
        justifyContent="space-between"
        alignItems="center"
        color="white"
        backgroundColor="#666"
        borderRadius="10px"
        p={1}
        m={1}
      >
        <Text pl={1} pt={1} pb={1} m={0} textAlign="start" width="7em">
          {code}
        </Text>
        <Text m={0} textAlign="start" width="20em">
          {truncate(data?.name, { length: 30 })}
        </Text>
        <Text justifySelf="flex-end" textAlign="end">
          créd: <b>{data?.credits?.[0]?.value}</b>
        </Text>
      </Flex>
    );
  }
);

const ForeplanContentRowList: FC = memo(() => {
  const [foreplanCourses] = useForeplanCourses();

  return (
    <AnimatePresence>
      {Object.keys(foreplanCourses).map(course => {
        return (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
            }}
            key={course}
            style={{ width: "100%" }}
          >
            <ForeplanContentRowListItem code={course} />
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
});

const ForeplanContentBadge: FC<Pick<ICourse, "code">> = memo(({ code }) => {
  const config = useContext(ConfigContext);
  const [data] = useForeplanCourseData({ code });
  const { width, dataCredits } = useMemo(() => {
    const dataCredits = data?.credits[0]?.value ?? 0;
    const width =
      config.FOREPLAN_SUMMARY_BADGE_COURSE_CREDITS_WIDTH.find(
        ({ min, max }) => {
          if (dataCredits >= min && dataCredits <= max) {
            return true;
          }
          return false;
        }
      )?.width ??
      config.FOREPLAN_SUMMARY_BADGE_COURSE_CREDITS_WIDTH[0]?.width ??
      "7em";
    return { width, dataCredits };
  }, [data?.credits, config]);

  return (
    <Badge
      m={2}
      p={2}
      width={width}
      textAlign="center"
      fontSize={config.FOREPLAN_SUMMARY_BADGE_FONT_SIZE}
    >
      {code}({dataCredits})
    </Badge>
  );
});

const ForeplanContentBadgesList: FC = memo(() => {
  const [foreplanCourses] = useForeplanCourses();

  return (
    <Flex wrap="wrap">
      <AnimatePresence>
        {Object.keys(foreplanCourses).map(course => {
          return (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
              }}
              key={course}
            >
              <ForeplanContentBadge code={course} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </Flex>
  );
});

const ForeplanTotalCredits: FC = memo(() => {
  const [totalCredits] = useForeplanTotalCreditsTaken();
  const config = useContext(ConfigContext);
  return (
    <Text>
      {config.FOREPLAN_SUMMARY_TOTAL_CREDITS_LABEL}: {totalCredits}
    </Text>
  );
});

const ForeplanContent: FC<Pick<ExpandedState, "expanded">> = memo(
  ({ expanded }) => {
    const config = useContext(ConfigContext);
    const { user } = useUser({ fetchPolicy: "cache-only" });

    return (
      <Stack
        p={expanded ? 3 : 0}
        overflowY={expanded ? "auto" : "hidden"}
        overflowX="hidden"
        width={expanded ? "35em" : "0px"}
        opacity={expanded ? 1 : 0}
        transition="all 0.5s ease-in-out"
      >
        <Text fontSize={config.FOREPLAN_SUMMARY_TITLE_FONT_SIZE}>
          {config.FOREPLAN_SUMMARY_TITLE_LABEL}
        </Text>
        {user?.config.FOREPLAN_SUMMARY_LIST && <ForeplanContentRowList />}
        {user?.config.FOREPLAN_SUMMARY_BADGES && <ForeplanContentBadgesList />}
        <ForeplanTotalCredits />
      </Stack>
    );
  }
);

const ForeplanSummary: FC = () => {
  const [{ active, foreplanCourses }] = useForeplanData();

  const anyForeplanCourses = useAnyForeplanCourses();

  const [expanded, setExpanded] = useRememberState(
    "foreplanSummaryExpanded",
    false
  );
  const foreplanCoursesArray = useMemo(() => Object.keys(foreplanCourses), [
    foreplanCourses,
  ]);
  const Summary = useMemo(() => {
    return (
      <OuterSummary>
        <SummaryTab expanded={expanded} setExpanded={setExpanded} />
        <ForeplanContent expanded={expanded} />
      </OuterSummary>
    );
  }, [foreplanCoursesArray, expanded, setExpanded]);

  return useMemo(
    () => (
      <AnimatePresence>
        {active && anyForeplanCourses && (
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
    ),
    [active, anyForeplanCourses, Summary]
  );
};

export default ForeplanSummary;
