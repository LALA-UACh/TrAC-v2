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
  useState,
} from "react";
import { FaGripLinesVertical } from "react-icons/fa";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { useWindowSize } from "react-use";
import usePortal from "react-useportal";
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
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";

import { ConfigContext } from "../../../context/Config";
import {
  ForeplanActiveStore,
  ForeplanHelperStore,
} from "../../../context/ForeplanContext";
import { setTrackingData, track } from "../../../context/Tracking";
import {
  customColor,
  TEXT_WHITE_SHADOW,
  zIndex700,
} from "../../../utils/cssConstants";
import { useUser } from "../../../utils/useUser";

const ForeplanContentRowList = dynamic(() => import("./List"));
const ForeplanContentBadgesList = dynamic(() => import("./Badges"));
interface ExpandedState {
  expanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
}

const OuterSummary: FC = ({ children }) => {
  const { width, height } = useWindowSize(1920, 1080);

  const config = useContext(ConfigContext);

  const positionMobile = useMemo(() => {
    return (
      width < config.FOREPLAN_SUMMARY_MOBILE_BREAKPOINT_WIDTH ||
      height < config.FOREPLAN_SUMMARY_MOBILE_BREAKPOINT_HEIGHT
    );
  }, [width, height, config]);

  const responsiveHeight = useMemo(() => {
    if (height < config.FOREPLAN_SUMMARY_HEIGHT) {
      return height;
    }
    return config.FOREPLAN_SUMMARY_HEIGHT;
  }, [height, config]);

  const { Portal } = usePortal();

  return useMemo(() => {
    const cmp = (
      <Flex
        pos={positionMobile ? "fixed" : "absolute"}
        top={positionMobile ? 0 : undefined}
        right={0}
        zIndex={600}
        backgroundColor={config.FOREPLAN_SUMMARY_BACKGROUND_COLOR}
        color={config.FOREPLAN_SUMMARY_FONT_COLOR}
        p={0}
        m={1}
        height="fit-content"
        maxHeight={responsiveHeight}
        width="fit-content"
        alignSelf="flex-end"
        justifySelf="flex-end"
        borderRadius={config.FOREPLAN_SUMMARY_BORDER_RADIUS}
      >
        {children}
      </Flex>
    );
    if (positionMobile) {
      return <Portal>{cmp}</Portal>;
    }
    return cmp;
  }, [children, positionMobile, config]);
};

const SummaryTab: FC<ExpandedState> = memo(({ expanded, setExpanded }) => {
  const nCourses = ForeplanActiveStore.hooks.useForeplanCoursesSize();
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
        setExpanded((expanded) => !expanded);
        setTrackingData({
          foreplanSummaryExpanded: !expanded,
        });
        track({
          action: "click",
          effect: expanded ? "close" : "open",
          target: "foreplan_summary_tab",
        });
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

const ForeplanTotalCredits: FC<{ isSummaryOpen?: boolean }> = memo(
  ({ isSummaryOpen }) => {
    const totalCredits = ForeplanActiveStore.hooks.useForeplanTotalCreditsTaken();
    const config = useContext(ConfigContext);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const isOverCredits = useMemo(() => {
      if (
        totalCredits > config.FOREPLAN_SUMMARY_TOTAL_CREDITS_NO_WARNING_LIMIT
      ) {
        if (isSummaryOpen) {
          setTimeout(() => {
            onOpen();
          }, 1000);
        } else {
          onClose();
        }
        return true;
      }
      onClose();
      return false;
    }, [
      isSummaryOpen,
      totalCredits > config.FOREPLAN_SUMMARY_TOTAL_CREDITS_NO_WARNING_LIMIT,
      onOpen,
      onClose,
    ]);

    return (
      <Flex wrap="wrap" alignItems="center">
        <Text
          m={0}
          fontSize={config.FOREPLAN_SUMMARY_TOTAL_CREDITS_LABEL_FONT_SIZE}
          alignItems="center"
          display="flex"
        >
          {config.FOREPLAN_SUMMARY_TOTAL_CREDITS_LABEL}:{" "}
          <Text
            as="b"
            color={
              isOverCredits
                ? config.FOREPLAN_SUMMARY_TOTAL_CREDITS_NUMBER_WARNING_COLOR
                : config.FOREPLAN_SUMMARY_TOTAL_CREDITS_NUMBER_NORMAL_COLOR
            }
            fontSize={
              isOverCredits
                ? config.FOREPLAN_SUMMARY_TOTAL_CREDITS_NUMBER_WARNING_FONT_SIZE
                : config.FOREPLAN_SUMMARY_TOTAL_CREDITS_NUMBER_NORMAL_FONT_SIZE
            }
            pl={1}
          >
            {totalCredits}
          </Text>
        </Text>
        <Popover
          isLazy
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
                size={config.FOREPLAN_SUMMARY_TOTAL_CREDITS_HELP_ICON_SIZE}
                verticalAlign="middle"
                cursor="help"
              />
            </Box>
          </PopoverTrigger>
          <PopoverContent
            color={
              isOverCredits
                ? config.FOREPLAN_SUMMARY_TOTAL_CREDITS_ADVICE_HELP_WARNING_LABEL_FONT_COLOR
                : config.FOREPLAN_SUMMARY_TOTAL_CREDITS_ADVICE_HELP_LABEL_FONT_COLOR
            }
            bg={
              isOverCredits
                ? config.FOREPLAN_SUMMARY_TOTAL_CREDITS_ADVICE_HELP_WARNING_LABEL_BACKGROUND_COLOR
                : config.FOREPLAN_SUMMARY_TOTAL_CREDITS_ADVICE_HELP_LABEL_BACKGROUND_COLOR
            }
            width="fit-content"
          >
            <PopoverBody
              padding={
                config.FOREPLAN_SUMMARY_TOTAL_CREDITS_ADVICE_HELP_BODY_PADDING
              }
            >
              {isOverCredits
                ? config.FOREPLAN_SUMMARY_TOTAL_CREDITS_ADVICE_HELP_WARNING_LABEL
                : config.FOREPLAN_SUMMARY_TOTAL_CREDITS_ADVICE_HELP_LABEL}
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Flex>
    );
  }
);

const ForeplanAdvice: FC = memo(() => {
  const totalCreditsTaken = ForeplanActiveStore.hooks.useForeplanTotalCreditsTaken();
  const advice = ForeplanHelperStore.hooks.useForeplanAdvice(totalCreditsTaken);
  const config = useContext(ConfigContext);
  if (advice) {
    const LowFailRate: FC = () => {
      return (
        <span
          css={customColor(
            config.FOREPLAN_SUMMARY_ADVICE_FAIL_RATES_COLORS.low
          )}
        >
          {advice.failRateLow}%
        </span>
      );
    };
    const MidFailRate: FC = () => {
      return (
        <span
          css={customColor(
            config.FOREPLAN_SUMMARY_ADVICE_FAIL_RATES_COLORS.mid
          )}
        >
          {advice.failRateMid}%
        </span>
      );
    };
    const HighFailRate: FC = () => {
      return (
        <span
          css={customColor(
            config.FOREPLAN_SUMMARY_ADVICE_FAIL_RATES_COLORS.high
          )}
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
  shouldHighlight?: boolean;
  highlightLabel: string;
  label: string;
}> = memo(
  ({
    failRateLow,
    failRateMid,
    failRateHigh,
    shouldHighlight,
    label,
    highlightLabel,
  }) => {
    const config = useContext(ConfigContext);

    const colors = config.FOREPLAN_SUMMARY_WAFFLE_COLORS_FAIL_RATE;
    const nLow = failRateLow;
    const nMid = nLow + failRateMid;
    // const nHigh = nMid + (failRate?.mid ?? 0);

    const rowRange = range(0, 10);
    const rectSize = config.FOREPLAN_SUMMARY_WAFFLE_SQUARE_SIZE;
    const separation = config.FOREPLAN_SUMMARY_WAFFLE_RECT_SEPARATION;
    const [tooltip, setTooltip] = useState("");
    const [tooltipBg, setTooltipBg] = useState("");

    return (
      <Stack alignItems="center">
        <Tooltip
          label={tooltip}
          aria-label={tooltip}
          zIndex={1000}
          placement="left"
          visibility={tooltip ? undefined : "hidden"}
          bg={tooltipBg || undefined}
          color="black"
          borderRadius="5px"
          fontSize="1.3rem"
          fontWeight="bold"
          textShadow={TEXT_WHITE_SHADOW}
          textAlign="center"
        >
          <Flex
            cursor="help"
            padding={config.FOREPLAN_SUMMARY_WAFFLE_PADDING}
            border={
              shouldHighlight
                ? `${config.FOREPLAN_SUMMARY_WAFFLE_HIGHLIGHT_BORDER} !important`
                : undefined
            }
            borderColor="white !important"
            marginTop={`${config.FOREPLAN_SUMMARY_WAFFLE_MARGIN_TOP} !important`}
            marginBottom={0}
            margin={0}
            borderWidth={
              shouldHighlight
                ? config.FOREPLAN_SUMMARY_WAFFLE_HIGHLIGHT_BORDER_WIDTH
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
              {flatMap(rowRange, (key1) => {
                return rowRange.map((key2) => {
                  const n = key1 * 10 + key2;
                  let fill: string;
                  let data_tip: string;
                  if (n < nLow) {
                    fill = colors.low;
                    data_tip = failRateLow + "%";
                  } else if (n < nMid) {
                    fill = colors.mid;
                    data_tip = failRateMid + "%";
                  } else {
                    fill = colors.high;
                    data_tip = failRateHigh + "%";
                  }
                  return (
                    <rect
                      key={n}
                      x={rectSize * key2 * separation}
                      y={rectSize * key1 * separation}
                      onMouseOver={() => {
                        if (tooltip !== data_tip) {
                          setTooltip(data_tip);
                        }
                        if (tooltipBg !== fill) {
                          setTooltipBg(fill);
                        }
                      }}
                      width={rectSize}
                      height={rectSize}
                      fill={fill}
                    />
                  );
                });
              })}
            </svg>
          </Flex>
        </Tooltip>
        <Text
          marginBottom={0}
          textAlign="center"
          m={0}
          color={config.FOREPLAN_SUMMARY_WAFFLE_LABEL_COLOR}
        >
          {label}
        </Text>
        {shouldHighlight && (
          <Text
            textAlign="center"
            color={config.FOREPLAN_SUMMARY_WAFFLE_HIGHLIGHT_LABEL_COLOR}
            m={0}
          >
            {highlightLabel}
          </Text>
        )}
      </Stack>
    );
  }
);

const ForeplanWaffleCharts: FC = memo(() => {
  const advices = ForeplanHelperStore.hooks.useForeplanAdvices();
  const totalCreditsTaken = ForeplanActiveStore.hooks.useForeplanTotalCreditsTaken();

  const { user } = useUser();

  const advicesType = user?.config.FOREPLAN_ADVICES_COMPARE_BY_PERFORMANCE
    ? "byPerformance"
    : "byLoad";
  const config = useContext(ConfigContext);

  return (
    <Flex color="black" justifyContent="space-between" overflowX="auto">
      {advices
        .filter(({ lowerBoundary, upperBoundary, isStudentCluster }) => {
          return advicesType === "byPerformance"
            ? totalCreditsTaken >= lowerBoundary &&
                totalCreditsTaken <= upperBoundary
            : isStudentCluster;
        })
        .map(
          (
            {
              upperBoundary,
              lowerBoundary,
              failRateLow,
              failRateMid,
              failRateHigh,
              clusterLabel,
              isStudentCluster,
            },
            key
          ) => {
            return (
              <Waffle
                key={key}
                failRateLow={failRateLow ?? 33}
                failRateMid={failRateMid ?? 66}
                failRateHigh={failRateHigh ?? 100}
                shouldHighlight={
                  advicesType === "byPerformance"
                    ? isStudentCluster
                    : totalCreditsTaken >= lowerBoundary &&
                      totalCreditsTaken <= upperBoundary
                }
                highlightLabel={
                  advicesType === "byPerformance"
                    ? config.FOREPLAN_SUMMARY_WAFFLE_HIGHLIGHT_BY_PERFORMANCE_LABEL
                    : config.FOREPLAN_SUMMARY_WAFFLE_HIGHLIGHT_BY_LOAD_LABEL
                }
                label={
                  advicesType === "byPerformance"
                    ? clusterLabel
                    : `${lowerBoundary} <= ${
                        config.FOREPLAN_SUMMARY_WAFFLE_LABEL_BY_LOAD
                      } <= ${
                        upperBoundary <=
                        config.FOREPLAN_SUMMARY_WAFFLE_LABEL_UPPER_BOUNDARY
                          ? upperBoundary
                          : config.FOREPLAN_SUMMARY_WAFFLE_LABEL_UPPER_BOUNDARY_TEXT
                      }`
                }
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
    const anyForeplanCourse = ForeplanActiveStore.hooks.useAnyForeplanCourses();

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
              <ForeplanTotalCredits isSummaryOpen={expanded} />
              {user?.config.FOREPLAN_SUMMARY_ADVICE && <ForeplanAdvice />}
              {user?.config.FOREPLAN_SUMMARY_WAFFLE_CHART && (
                <ForeplanWaffleCharts />
              )}
            </>
          )}
        </>
      );
    }, [expanded, anyForeplanCourse, user, config]);

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
  const active = ForeplanActiveStore.hooks.useIsForeplanActive();

  const anyForeplanCourses = ForeplanActiveStore.hooks.useAnyForeplanCourses();

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
          css={zIndex700}
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
