import { AnimatePresence, motion } from "framer-motion";
import { map, truncate } from "lodash";
import React, {
  Dispatch,
  FC,
  memo,
  SetStateAction,
  useContext,
  useMemo,
} from "react";
import { FaGripLinesVertical } from "react-icons/fa";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { useWindowSize } from "react-use";
import { useRememberState } from "use-remember-state";

import {
  Badge,
  Box,
  Flex,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/core";
import { Waffle } from "@nivo/waffle";

import { ICourse } from "../../../interfaces";
import { useUser } from "../../utils/useUser";
import { ConfigContext } from "../Config";
import {
  useAnyForeplanCourses,
  useForeplanAdvice,
  useForeplanCourseData,
  useForeplanCourses,
  useForeplanCoursesSize,
  useForeplanTotalCreditsTaken,
  useIsForeplanActive,
} from "./ForeplanContext";

interface ExpandedState {
  expanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
}

const OuterSummary: FC = ({ children }) => {
  const { width, height } = useWindowSize();

  const {
    FOREPLAN_TAB_POSITION_MOBILE_BREAKPOINT_WIDTH,
    FOREPLAN_TAB_POSITION_MOBILE_BREAKPOINT_HEIGHT,
  } = useContext(ConfigContext);

  const positionMobile = useMemo(() => {
    return (
      width < FOREPLAN_TAB_POSITION_MOBILE_BREAKPOINT_WIDTH ||
      height < FOREPLAN_TAB_POSITION_MOBILE_BREAKPOINT_HEIGHT
    );
  }, [
    height,
    FOREPLAN_TAB_POSITION_MOBILE_BREAKPOINT_WIDTH,
    FOREPLAN_TAB_POSITION_MOBILE_BREAKPOINT_HEIGHT,
  ]);

  return (
    <Flex
      pos={positionMobile ? "fixed" : "absolute"}
      top={positionMobile ? 0 : undefined}
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
      <AnimatePresence>{!expanded && nCourses > 0 && NText}</AnimatePresence>

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
      {code} ({dataCredits})
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
  const { isOpen, onOpen, onClose } = useDisclosure(false);

  return (
    <Flex wrap="wrap" alignItems="center">
      <Text
        m={0}
        fontSize={config.FOREPLAN_SUMMARY_TOTAL_CREDITS_LABEL_FONT_SIZE}
      >
        {config.FOREPLAN_SUMMARY_TOTAL_CREDITS_LABEL}: <b>{totalCredits}</b>
      </Text>
      <Popover
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        trigger="hover"
      >
        <PopoverTrigger>
          <Box
            m={2}
            as={IoMdHelpCircleOutline}
            size={config.FOREPLAN_SUMMARY_TOTAL_CREDITS_NUMBER_SIZE}
          />
        </PopoverTrigger>
        <PopoverContent color="black" width="fit-content">
          <PopoverBody>Lorem Ipsum</PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
  );
});

const ForeplanAdvice: FC = memo(() => {
  const [{ titleText, paragraphText }] = useForeplanAdvice();

  return (
    <Stack>
      <Text>{titleText}</Text>
      <Text>{paragraphText}</Text>
    </Stack>
  );
});

const ForeplanWaffleChart: FC = memo(() => {
  const [{ failRate }] = useForeplanAdvice();
  console.log({ failRate });
  return (
    <Box>
      <Waffle
        width={100}
        height={100}
        padding={1}
        data={map(failRate, (value, id) => {
          return {
            id,
            label: id,
            value,
            color: "#468df3",
          };
        })}
        total={100}
        rows={10}
        columns={10}
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        animate={true}
        motionStiffness={90}
        motionDamping={11}
      />
    </Box>
  );
});

const ForeplanContent: FC<Pick<ExpandedState, "expanded">> = memo(
  ({ expanded }) => {
    const config = useContext(ConfigContext);
    const { user } = useUser({ fetchPolicy: "cache-only" });
    const { width } = useWindowSize();
    const widthContent = useMemo(() => {
      if (width < 535) {
        return width - 35 + "px";
      }
      return "500px";
    }, [width]);
    const [anyForeplanCourse] = useAnyForeplanCourses();

    const content = useMemo(() => {
      return (
        <>
          <Text fontSize={config.FOREPLAN_SUMMARY_TITLE_FONT_SIZE}>
            {config.FOREPLAN_SUMMARY_TITLE_LABEL}
          </Text>
          {anyForeplanCourse && (
            <>
              {user?.config.FOREPLAN_SUMMARY_LIST && <ForeplanContentRowList />}
              {user?.config.FOREPLAN_SUMMARY_BADGES && (
                <ForeplanContentBadgesList />
              )}
              <ForeplanTotalCredits />
              <Flex justifyContent="space-between">
                {user?.config.FOREPLAN_SUMMARY_ADVICE && <ForeplanAdvice />}
                {user?.config.FOREPLAN_SUMMARY_WAFFLE_CHART && (
                  <ForeplanWaffleChart />
                )}
              </Flex>
            </>
          )}
        </>
      );
    }, [anyForeplanCourse, user, config]);

    return (
      <motion.div
        initial="collapsed"
        animate={expanded ? "expanded" : "collapsed"}
        variants={{
          expanded: {
            padding: 3,
            width: widthContent,
            opacity: 1,
            overflowY: "auto",
          },
          collapsed: {
            padding: 0,
            width: 0,
            opacity: 0,
            overflowY: "hidden",
          },
        }}
      >
        <Stack
          p={expanded ? 3 : 0}
          overflowX="hidden"
          opacity={expanded ? undefined : 0}
        >
          {content}
        </Stack>
      </motion.div>
    );
  }
);

const ForeplanSummary: FC = () => {
  const [active] = useIsForeplanActive();

  const [anyForeplanCourses] = useAnyForeplanCourses();

  const [expanded, setExpanded] = useRememberState(
    "foreplanSummaryExpanded",
    false
  );

  const Summary = useMemo(() => {
    return (
      <OuterSummary>
        <SummaryTab expanded={expanded} setExpanded={setExpanded} />

        <ForeplanContent expanded={expanded} />
      </OuterSummary>
    );
  }, [expanded, setExpanded]);

  return (
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
  );
};

export default ForeplanSummary;
