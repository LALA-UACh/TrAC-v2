import React, {
  FC,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  IoMdCheckmarkCircle,
  IoMdCloseCircle,
  IoMdHelpCircle,
} from "react-icons/io";
import { useDebounce, useUpdateEffect } from "react-use";

import {
  Box,
  Flex,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Text,
} from "@chakra-ui/core";

import { ICourse } from "../../../../../interfaces";
import { StateCourse } from "../../../../constants";
import { ConfigContext } from "../../../context/Config";
import { CoursesDashboardStore } from "../../../context/CoursesDashboard";
import { ForeplanActiveStore } from "../../../context/ForeplanContext";
import { track } from "../../../context/Tracking";
import { customColor, TEXT_WHITE_SHADOW } from "../../../utils/cssConstants";

export const PredictState: FC<
  Pick<ICourse, "code"> & { isCourseOpen: boolean }
> = ({ code }) => {
  const predictionState = ForeplanActiveStore.hooks.usePredictionState(code);
  const [isOpenPrediction, setIsOpenPrediction] = useState(false);
  const config = useContext(ConfigContext);
  const CoursesOpen = CoursesDashboardStore.hooks.useDashboardCoursesOpen();

  const wasOpen = useRef(false);

  const onOpen = useCallback(() => {
    setIsOpenPrediction(true);
  }, [setIsOpenPrediction]);

  const onClose = useCallback(() => {
    setIsOpenPrediction(false);
  }, [setIsOpenPrediction]);

  useUpdateEffect(() => {
    if (isOpenPrediction) {
      wasOpen.current = true;
      setIsOpenPrediction(false);
    }
  }, [CoursesOpen]);

  useDebounce(
    () => {
      if (wasOpen.current) {
        wasOpen.current = false;
        setIsOpenPrediction(true);
      }
    },
    500,
    [CoursesOpen]
  );

  const {
    FOREPLAN_STATE_PREDICTION_APPROVED_COLOR,
    FOREPLAN_STATE_PREDICTION_FAILED_COLOR,
    FOREPLAN_STATE_PREDICTION_PENDING_COLOR,
    FOREPLAN_STATE_PREDICTION_APPROVED_SYMBOL,
    FOREPLAN_STATE_PREDICTION_FAILED_SYMBOL,
    FOREPLAN_STATE_PREDICTION_UNKNOWN_SYMBOL,
    FOREPLAN_STATE_PREDICTION_UNKNOWN_LABEL,
    FOREPLAN_STATE_PREDICTION_LABEL_PRE,
    FOREPLAN_STATE_PREDICTION_APPROVED_LABEL,
    FOREPLAN_STATE_PREDICTION_FAILED_LABEL,
  } = config;

  const Trigger = useMemo(() => {
    switch (predictionState) {
      case StateCourse.Passed: {
        return (
          <Text
            className="cursorPointer"
            fontSize="2em"
            fontWeight="bold"
            margin={0}
            background={FOREPLAN_STATE_PREDICTION_APPROVED_COLOR}
            marginTop={1}
            paddingLeft={1}
            paddingRight={1}
            borderRadius="5px"
            border="1px solid black"
            textShadow={TEXT_WHITE_SHADOW}
          >
            {FOREPLAN_STATE_PREDICTION_APPROVED_SYMBOL}
          </Text>
        );
      }
      case StateCourse.Failed: {
        return (
          <Text
            className="cursorPointer"
            fontSize="2em"
            fontWeight="bold"
            margin={0}
            background={FOREPLAN_STATE_PREDICTION_FAILED_COLOR}
            marginTop={1}
            paddingLeft={1}
            paddingRight={1}
            borderRadius="5px"
            border="1px solid black"
            textShadow={TEXT_WHITE_SHADOW}
          >
            {FOREPLAN_STATE_PREDICTION_FAILED_SYMBOL}
          </Text>
        );
      }
      default: {
        return (
          <Text
            className="cursorPointer"
            fontSize="2em"
            fontWeight="bold"
            margin={0}
            marginTop={1}
            paddingLeft={1}
            paddingRight={1}
            borderRadius="5px"
            border="1px solid black"
            textShadow={TEXT_WHITE_SHADOW}
          >
            {FOREPLAN_STATE_PREDICTION_UNKNOWN_SYMBOL}
          </Text>
        );
      }
    }
  }, [predictionState, config]);

  return (
    <Popover
      onClose={onClose}
      onOpen={onOpen}
      isOpen={isOpenPrediction}
      trigger="click"
      placement="right"
      usePortal
    >
      <PopoverTrigger>{Trigger}</PopoverTrigger>
      <PopoverContent
        width="fit-content"
        className="popover"
        zIndex={1001}
        border="1px solid grey"
      >
        <PopoverCloseButton padding={0} bg="white" />
        <PopoverArrow />
        <PopoverBody>
          <Stack justifyContent="center" padding={2}>
            <Flex
              alignItems="center"
              onClick={() => {
                track({
                  action: "click",
                  target: `predict-state-${code}`,
                  effect: "set-unknown",
                });
                onClose();
                ForeplanActiveStore.actions.setCoursePrediction(
                  { code },
                  StateCourse.Current
                );
              }}
              className="cursorPointer predictionStateRow"
            >
              <Box
                as={IoMdHelpCircle}
                size="1em"
                marginRight={2}
                color={`${FOREPLAN_STATE_PREDICTION_PENDING_COLOR} !important`}
              />
              <Text>{FOREPLAN_STATE_PREDICTION_UNKNOWN_LABEL}</Text>
            </Flex>
            <Flex
              alignItems="center"
              onClick={() => {
                track({
                  action: "click",
                  target: `predict-state-${code}`,
                  effect: "set-passed",
                });
                onClose();
                ForeplanActiveStore.actions.setCoursePrediction(
                  { code },
                  StateCourse.Passed
                );
              }}
              className="cursorPointer predictionStateRow"
            >
              <Box
                as={IoMdCheckmarkCircle}
                size="1em"
                marginRight={2}
                color={`${FOREPLAN_STATE_PREDICTION_APPROVED_COLOR} !important`}
              />

              <Text>
                {FOREPLAN_STATE_PREDICTION_LABEL_PRE}{" "}
                <span
                  css={customColor(FOREPLAN_STATE_PREDICTION_APPROVED_COLOR)}
                >
                  {FOREPLAN_STATE_PREDICTION_APPROVED_LABEL}
                </span>
              </Text>
            </Flex>
            <Flex
              alignItems="center"
              onClick={() => {
                track({
                  action: "click",
                  target: `predict-state-${code}`,
                  effect: "set-failed",
                });
                onClose();
                ForeplanActiveStore.actions.setCoursePrediction(
                  { code },
                  StateCourse.Failed
                );
              }}
              className="cursorPointer predictionStateRow"
            >
              <Box
                as={IoMdCloseCircle}
                size="1em"
                marginRight={2}
                color={`${FOREPLAN_STATE_PREDICTION_FAILED_COLOR} !important`}
              />
              <Text>
                {FOREPLAN_STATE_PREDICTION_LABEL_PRE}{" "}
                <span css={customColor(FOREPLAN_STATE_PREDICTION_FAILED_COLOR)}>
                  {FOREPLAN_STATE_PREDICTION_FAILED_LABEL}
                </span>
              </Text>
            </Flex>
          </Stack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
