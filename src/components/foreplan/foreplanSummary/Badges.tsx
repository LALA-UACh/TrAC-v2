import { AnimatePresence, motion } from "framer-motion";
import { map } from "lodash";
import React, {
  FC,
  memo,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { useClickAway } from "react-use";

import { Box, Flex, Stack, Text } from "@chakra-ui/core";

import { ICourse } from "../../../../interfaces";
import { ConfigContext } from "../../../context/Config";
import { useTracking } from "../../../context/Tracking";
import {
  ForeplanActiveStore,
  ICreditsNumber,
} from "../../../contextNew/ForeplanContext";

const CourseBadge: FC<Pick<ICourse, "code" | "name"> & ICreditsNumber> = memo(
  ({ code, name, credits }) => {
    const config = useContext(ConfigContext);

    const [expanded, setExpanded] = useState(false);
    const [, { track }] = useTracking();

    const width = useMemo(() => {
      const width =
        config.FOREPLAN_SUMMARY_BADGE_COURSE_CREDITS_WIDTH.find(
          ({ min, max }) => {
            if (credits >= min && credits <= max) {
              return true;
            }
            return false;
          }
        )?.width ??
        config.FOREPLAN_SUMMARY_BADGE_COURSE_CREDITS_WIDTH[0]?.width ??
        "7em";
      return width;
    }, [credits, config]);

    const ref = useRef(null);

    const clickAway = useCallback(() => {
      if (expanded) {
        setExpanded(false);
        track({
          action: "click",
          effect: "close_course_badge",
          target: `foreplan_outside_${code}_badge`,
        });
      }
    }, [expanded, setExpanded, track, code]);

    const expandBadge = useCallback(
      (ev: React.MouseEvent<any, MouseEvent>) => {
        ev.preventDefault();
        ev.stopPropagation();
        if (!expanded) {
          setExpanded(true);
          track({
            action: "click",
            effect: "open_course_badge",
            target: `foreplan_${code}_badge`,
          });
        }
      },
      [expanded, setExpanded, track, code]
    );

    useClickAway(ref, clickAway, ["click", "mousedown"]);

    return (
      <div ref={ref}>
        <Stack
          m={config.FOREPLAN_SUMMARY_BADGE_MARGIN}
          p={config.FOREPLAN_SUMMARY_BADGE_PADDING}
          width={width}
          height="fit-content"
          fontSize={config.FOREPLAN_SUMMARY_BADGE_FONT_SIZE}
          onClick={expandBadge}
          backgroundColor={config.FOREPLAN_SUMMARY_BADGE_BACKGROUND_COLOR}
          color={config.FOREPLAN_SUMMARY_BADGE_FONT_COLOR}
          transition="all 1s ease-in-out"
          borderRadius={config.FOREPLAN_SUMMARY_BADGE_BORDER_RADIUS}
          cursor={expanded ? undefined : "pointer"}
        >
          <Text
            key={expanded ? 1 : 0}
            textAlign={expanded ? "initial" : "center"}
            onClick={expandBadge}
            fontWeight={expanded ? "bold" : undefined}
          >
            {expanded ? (
              <span>{code}</span>
            ) : (
              <span>
                {code} (<b>{credits}</b>)
              </span>
            )}
          </Text>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                }}
                key="name"
                onClick={expandBadge}
              >
                <Text
                  pb={4}
                  wordBreak="break-word"
                  fontSize={config.FOREPLAN_SUMMARY_BADGE_COURSE_NAME_FONT_SIZE}
                >
                  {name}
                </Text>
              </motion.div>
            )}
            {expanded && (
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                }}
                key="credits"
              >
                <Flex
                  justifyContent="space-between"
                  alignItems="center"
                  fontSize={
                    config.FOREPLAN_SUMMARY_BADGE_EXPANDED_CREDITS_FONT_SIZE
                  }
                >
                  <Text
                    m={0}
                    fontWeight="bold"
                    textAlign={expanded ? "initial" : "center"}
                  >
                    {config.CREDITS_LABEL}: {credits}
                  </Text>
                  <Box
                    as={IoMdCloseCircleOutline}
                    size="20px"
                    cursor="pointer"
                    onClick={ev => {
                      ev.stopPropagation();
                      ForeplanActiveStore.actions.removeCourseForeplan(code);
                      track({
                        action: "click",
                        effect: "remove_course_foreplan",
                        target: `foreplan_${code}_remove_icon_badge`,
                      });
                    }}
                  />
                </Flex>
              </motion.div>
            )}
          </AnimatePresence>
        </Stack>
      </div>
    );
  }
);

const ForeplanContentBadgesList: FC = memo(() => {
  const foreplanCourses = ForeplanActiveStore.hooks.useForeplanCourses();

  return (
    <Flex wrap="wrap">
      <AnimatePresence>
        {map(foreplanCourses, ({ name, credits }, course) => {
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
              <CourseBadge code={course} name={name} credits={credits} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </Flex>
  );
});

export default ForeplanContentBadgesList;
