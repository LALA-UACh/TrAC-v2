import { AnimatePresence, motion } from "framer-motion";
import { range, truncate } from "lodash";
import Markdown from "markdown-to-jsx";
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

  const config = useContext(ConfigContext);

  const positionMobile = useMemo(() => {
    return (
      width < config.FOREPLAN_SUMMARY_MOBILE_BREAKPOINT_HEIGHT ||
      height < config.FOREPLAN_SUMMARY_POSITION_MOBILE_BREAKPOINT_WIDTH
    );
  }, [height, config]);

  return useMemo(
    () => (
      <Flex
        pos={positionMobile ? "fixed" : "absolute"}
        top={positionMobile ? 0 : undefined}
        right={0}
        zIndex={100}
        backgroundColor={config.FOREPLAN_SUMMARY_BACKGROUND_COLOR}
        color={config.FOREPLAN_SUMMARY_FONT_COLOR}
        p={0}
        m={1}
        height={config.FOREPLAN_SUMMARY_HEIGHT}
        width="fit-content"
        alignSelf="flex-end"
        justifySelf="flex-end"
        borderRadius={config.FOREPLAN_SUMMARY_BORDER_RADIUS}
      >
        {children}
      </Flex>
    ),
    [children, positionMobile, config]
  );
};

const SummaryTab: FC<ExpandedState> = memo(({ expanded, setExpanded }) => {
  const [nCourses] = useForeplanCoursesSize();
  const config = useContext(ConfigContext);
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
          fontSize={
            nCourses >= 10
              ? config.FOREPLAN_SUMMARY_TAB_NUMBER_FONT_SIZE.twoDigits
              : config.FOREPLAN_SUMMARY_TAB_NUMBER_FONT_SIZE.oneDigit
          }
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
      width={config.FOREPLAN_SUMMARY_TAB_WIDTH}
    >
      <AnimatePresence>{!expanded && nCourses > 0 && NText}</AnimatePresence>

      <Box
        pos="absolute"
        height="100%"
        verticalAlign="middle"
        as={FaGripLinesVertical}
        fontSize={config.FOREPLAN_SUMMARY_TAB_ICON_SIZE}
        color={config.FOREPLAN_SUMMARY_TAB_COLOR}
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
          <Box>
            <Box
              m={2}
              as={IoMdHelpCircleOutline}
              size={config.FOREPLAN_SUMMARY_TOTAL_CREDITS_NUMBER_SIZE}
              verticalAlign="middle"
            />
          </Box>
        </PopoverTrigger>
        <PopoverContent color="black" width="fit-content">
          <PopoverBody>Lorem Ipsum</PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
  );
});

const ForeplanAdvice: FC = memo(() => {
  const [advice] = useForeplanAdvice();
  const config = useContext(ConfigContext);
  if (advice) {
    const Low: FC = () => {
      return (
        <span
          style={{
            color: config.FOREPLAN_SUMMARY_ADVICE_FAIL_RATES_COLORS.low,
          }}
        >
          {advice.failRate.low}%
        </span>
      );
    };
    const Mid: FC = () => {
      return (
        <span
          style={{
            color: config.FOREPLAN_SUMMARY_ADVICE_FAIL_RATES_COLORS.mid,
          }}
        >
          {advice.failRate.mid}%
        </span>
      );
    };
    const High: FC = () => {
      return (
        <span
          style={{
            color: config.FOREPLAN_SUMMARY_ADVICE_FAIL_RATES_COLORS.high,
          }}
        >
          {advice.failRate.high}%
        </span>
      );
    };
    return (
      <Stack>
        <Text
          fontWeight="bold"
          fontSize={config.FOREPLAN_SUMMARY_ADVICE_TITLE_FONT_SIZE}
        >
          {advice.titleText}
        </Text>
        <Box fontSize={config.FOREPLAN_SUMMARY_ADVICE_PARAGRAPH_FONT_SIZE}>
          <Markdown
            options={{
              overrides: {
                Low: {
                  component: Low,
                },
                Mid: {
                  component: Mid,
                },
                High: {
                  component: High,
                },
              },
            }}
          >
            {advice.paragraphText}
          </Markdown>
        </Box>
      </Stack>
    );
  }

  return null;
});

const Waffle: FC<{
  failRate: { low: number; mid: number; high: number };
}> = memo(({ failRate }) => {
  const config = useContext(ConfigContext);

  const colors = config.FOREPLAN_SUMMARY_WAFFLE_COLORS_FAIL_RATE;
  const nLow = failRate.low;
  const nMid = nLow + failRate.mid;
  // const nHigh = nMid + (failRate?.mid ?? 0);

  const rowRange = range(0, 10);
  const rectSize = config.FOREPLAN_SUMMARY_WAFFLE_SQUARE_SIZE;
  const separation = config.FOREPLAN_SUMMARY_WAFFLE_RECT_SEPARATION;

  return (
    <svg
      width={config.FOREPLAN_SUMMARY_WAFFLE_SIZE}
      height={config.FOREPLAN_SUMMARY_WAFFLE_SIZE}
    >
      <svg
        x={config.FOREPLAN_SUMMARY_WAFFLE_TRANSLATE_X}
        y={config.FOREPLAN_SUMMARY_WAFFLE_TRANSLATE_Y}
      >
        {rowRange.flatMap(key1 => {
          return rowRange.map(key2 => {
            const n = key1 * 10 + key2;
            let fill: string;
            if (n < nLow) {
              fill = colors.low;
            } else if (n < nMid) {
              fill = colors.mid;
            } else {
              fill = colors.high;
            }
            return (
              <rect
                key={n}
                x={rectSize * key2 * separation}
                y={rectSize * key1 * separation}
                width={rectSize}
                height={rectSize}
                fill={fill}
              />
            );
          });
        })}
      </svg>
    </svg>
  );
});

const ForeplanWaffleChart: FC = memo(() => {
  const [advice] = useForeplanAdvice();
  if (advice?.failRate) {
    return (
      <Box color="black">
        <Waffle failRate={advice.failRate} />
      </Box>
    );
  }

  return null;
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
              <Flex justifyContent="space-between" alignItems="flex-end">
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
