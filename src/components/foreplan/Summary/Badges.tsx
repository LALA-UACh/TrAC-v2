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
import {
  ICreditsNumber,
  useForeplanActiveActions,
  useForeplanCourses,
} from "../../../context/ForeplanContext";

const ForeplanContentBadge: FC<Pick<ICourse, "code" | "name"> &
  ICreditsNumber> = memo(({ code, name, credits }) => {
  const config = useContext(ConfigContext);
  const [, { removeCourseForeplan }] = useForeplanActiveActions();
  const [expanded, setExpanded] = useState(false);
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
    }
  }, [expanded, setExpanded]);

  const expandBadge = useCallback(
    (ev: React.MouseEvent<any, MouseEvent>) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (!expanded) {
        setExpanded(true);
      }
    },
    [expanded, setExpanded]
  );

  useClickAway(ref, clickAway, ["click", "mousedown"]);

  return (
    <div ref={ref}>
      <Stack
        m={2}
        p={2}
        pl="1em"
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
                    removeCourseForeplan(code);
                  }}
                />
              </Flex>
            </motion.div>
          )}
        </AnimatePresence>
      </Stack>
    </div>
  );
});

const ForeplanContentBadgesList: FC = memo(() => {
  const [foreplanCourses] = useForeplanCourses();

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
              <ForeplanContentBadge
                code={course}
                name={name}
                credits={credits}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </Flex>
  );
});

export default ForeplanContentBadgesList;
