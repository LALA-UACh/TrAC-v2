import { AnimatePresence, motion } from "framer-motion";
import { flatMap, range } from "lodash";
import Markdown from "markdown-to-jsx";
import dynamic from "next/dynamic";
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
import ReactTooltip from "react-tooltip";
import { useWindowSize } from "react-use";
import { useRememberState } from "use-remember-state";

import {
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

import { ConfigContext } from "../../../context/Config";
import {
  useAnyForeplanCourses,
  useForeplanAdvice,
  useForeplanAdvices,
  useForeplanCoursesSize,
  useForeplanTotalCreditsTaken,
  useIsForeplanActive,
} from "../../../context/ForeplanContext";
import { useUser } from "../../../utils/useUser";

const ForeplanContentRowList = dynamic(() => import("./List"));
const ForeplanContentBadgesList = dynamic(() => import("./Badges"));
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

  const responsiveHeight = useMemo(() => {
    if (height < config.FOREPLAN_SUMMARY_HEIGHT) {
      return height;
    }
    return config.FOREPLAN_SUMMARY_HEIGHT;
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
        height={responsiveHeight}
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
          <PopoverBody>
            {config.FOREPLAN_SUMMARY_ADVICE_CREDITS_HELP}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
  );
});

const ForeplanAdvice: FC = memo(() => {
  const [advice] = useForeplanAdvice();
  const config = useContext(ConfigContext);
  if (advice) {
    const LowFailRate: FC = () => {
      return (
        <span
          style={{
            color: config.FOREPLAN_SUMMARY_ADVICE_FAIL_RATES_COLORS.low,
          }}
        >
          {advice.failRateLow}%
        </span>
      );
    };
    const MidFailRate: FC = () => {
      return (
        <span
          style={{
            color: config.FOREPLAN_SUMMARY_ADVICE_FAIL_RATES_COLORS.mid,
          }}
        >
          {advice.failRateMid}%
        </span>
      );
    };
    const HighFailRate: FC = () => {
      return (
        <span
          style={{
            color: config.FOREPLAN_SUMMARY_ADVICE_FAIL_RATES_COLORS.high,
          }}
        >
          {advice.failRateHigh}%
        </span>
      );
    };
    return (
      <Stack>
        <Text
          fontWeight="bold"
          fontSize={config.FOREPLAN_SUMMARY_ADVICE_TITLE_FONT_SIZE}
        >
          {advice.adviceTitle}
        </Text>
        <Box fontSize={config.FOREPLAN_SUMMARY_ADVICE_PARAGRAPH_FONT_SIZE}>
          <Markdown
            options={{
              overrides: {
                LowFailRate: {
                  component: LowFailRate,
                },
                MidFailRate: {
                  component: MidFailRate,
                },
                HighFailRate: {
                  component: HighFailRate,
                },
              },
            }}
          >
            {advice.adviceParagraph}
          </Markdown>
        </Box>
      </Stack>
    );
  }

  return null;
});

const Waffle: FC<{
  failRateLow: number;
  failRateMid: number;
  failRateHigh: number;
  isStudentCluster?: boolean;
  label: string;
}> = memo(
  ({ failRateLow, failRateMid, failRateHigh, isStudentCluster, label }) => {
    const config = useContext(ConfigContext);

    const colors = config.FOREPLAN_SUMMARY_WAFFLE_COLORS_FAIL_RATE;
    const nLow = failRateLow;
    const nMid = nLow + failRateMid;
    // const nHigh = nMid + (failRate?.mid ?? 0);

    const rowRange = range(0, 10);
    const rectSize = config.FOREPLAN_SUMMARY_WAFFLE_SQUARE_SIZE;
    const separation = config.FOREPLAN_SUMMARY_WAFFLE_RECT_SEPARATION;

    return (
      <Stack alignItems="center">
        <Flex
          padding={config.FOREPLAN_SUMMARY_WAFFLE_PADDING}
          border={
            isStudentCluster
              ? config.FOREPLAN_SUMMARY_WAFFLE_IS_STUDENT_CLUSTER_BORDER
              : undefined
          }
          marginTop={`${config.FOREPLAN_SUMMARY_WAFFLE_MARGIN_TOP} !important`}
          marginBottom={0}
          margin={0}
          borderWidth={
            isStudentCluster
              ? config.FOREPLAN_SUMMARY_WAFFLE_IS_STUDENT_CLUSTER_BORDER_WIDTH
              : undefined
          }
          direction="column"
          alignItems="center"
          justifyContent="center"
          className="waffleContainer"
          width="fit-content"
          height="fit-content"
        >
          <svg
            width={config.FOREPLAN_SUMMARY_WAFFLE_SIZE}
            height={config.FOREPLAN_SUMMARY_WAFFLE_SIZE}
          >
            {flatMap(rowRange, key1 => {
              return rowRange.map(key2 => {
                const n = key1 * 10 + key2;
                let fill: string;
                let data_tip: string;
                let data_type: "success" | "warning" | "error";
                if (n < nLow) {
                  fill = colors.low;
                  data_tip = failRateLow + "%";
                  data_type = "success";
                } else if (n < nMid) {
                  fill = colors.mid;
                  data_tip = failRateMid + "%";
                  data_type = "warning";
                } else {
                  fill = colors.high;
                  data_tip = failRateHigh + "%";
                  data_type = "error";
                }
                return (
                  <rect
                    key={n}
                    data-type={data_type}
                    data-tip={data_tip}
                    data-for="waffle_tooltip"
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
        </Flex>
        <Text
          marginBottom={0}
          textAlign="center"
          m={0}
          color={config.FOREPLAN_SUMMARY_WAFFLE_LABEL_COLOR}
        >
          {label}
        </Text>
        {isStudentCluster && (
          <Text
            textAlign="center"
            color={
              config.FOREPLAN_SUMMARY_WAFFLE_IS_STUDENT_CLUSTER_LABEL_COLOR
            }
            m={0}
          >
            {config.FOREPLAN_SUMMARY_WAFFLE_IS_STUDENT_CLUSTER_LABEL}
          </Text>
        )}
        <ReactTooltip id="waffle_tooltip" delayHide={300} />
      </Stack>
    );
  }
);

const ForeplanWaffleCharts: FC = memo(() => {
  const [advices] = useForeplanAdvices();
  const [totalCreditsTaken] = useForeplanTotalCreditsTaken();

  return (
    <Flex color="black" justifyContent="space-between">
      {advices
        .filter(({ lowerBoundary, upperBoundary }) => {
          return (
            totalCreditsTaken >= lowerBoundary &&
            totalCreditsTaken <= upperBoundary
          );
        })
        .map(
          (
            { failRateLow, failRateMid, failRateHigh, label, isStudentCluster },
            key
          ) => {
            return (
              <Waffle
                key={key}
                failRateLow={failRateLow ?? 33}
                failRateMid={failRateMid ?? 66}
                failRateHigh={failRateHigh ?? 100}
                isStudentCluster={isStudentCluster}
                label={label}
              />
            );
          }
        )}
    </Flex>
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
          <Text
            marginBottom={config.FOREPLAN_SUMMARY_TITLE_MARGIN_BOTTOM}
            fontSize={config.FOREPLAN_SUMMARY_TITLE_FONT_SIZE}
          >
            {config.FOREPLAN_SUMMARY_TITLE_LABEL}
          </Text>
          {anyForeplanCourse && (
            <>
              {user?.config.FOREPLAN_SUMMARY_LIST && <ForeplanContentRowList />}
              {user?.config.FOREPLAN_SUMMARY_BADGES && (
                <ForeplanContentBadgesList />
              )}
              <ForeplanTotalCredits />
              {user?.config.FOREPLAN_SUMMARY_ADVICE && <ForeplanAdvice />}
              {user?.config.FOREPLAN_SUMMARY_WAFFLE_CHART && (
                <ForeplanWaffleCharts />
              )}
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
          p={expanded ? config.FOREPLAN_SUMMARY_CONTENT_EXPANDED_PADDING : 0}
          overflowX="hidden"
          opacity={expanded ? 1 : 0}
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
          style={{ zIndex: 1000 }}
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
