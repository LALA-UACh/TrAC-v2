import React, {
  FC,
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
  useContext,
} from "react";
import {
  IoMdCheckmarkCircle,
  IoMdCloseCircle,
  IoMdHelpCircle,
} from "react-icons/io";

import {
  Box,
  Flex,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Text,
  PopoverArrow,
} from "@chakra-ui/core";

import { StateCourse } from "../../../../constants";
import { ICourse } from "../../../../interfaces";
import { ForeplanActiveStore } from "../../../context/ForeplanContext";
import { useUpdateEffect, useDebounce } from "react-use";
import { CoursesDashboardStore } from "../../../context/CoursesDashboard";
import { ConfigContext } from "../../../context/Config";

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

  const ApprovedColor = config.FOREPLAN_STATE_PREDICTION_APPROVED_COLOR;
  const FailedColor = config.FOREPLAN_STATE_PREDICTION_FAILED_COLOR;
  const PendingColor = config.FOREPLAN_STATE_PREDICTION_PENDING_COLOR;

  const Trigger = useMemo(() => {
    switch (predictionState) {
      case StateCourse.Passed: {
        return (
          <Text
            className="cursorPointer"
            fontSize="2em"
            fontWeight="bold"
            margin={0}
            background={ApprovedColor}
            marginTop={1}
            paddingLeft={1}
            paddingRight={1}
            borderRadius="5px"
            border="1px solid black"
          >
            A
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
            background={FailedColor}
            marginTop={1}
            paddingLeft={1}
            paddingRight={1}
            borderRadius="5px"
            border="1px solid black"
          >
            R
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
          >
            ?
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
                color={`${PendingColor} !important`}
              />
              <Text>no lo sé</Text>
            </Flex>
            <Flex
              alignItems="center"
              onClick={() => {
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
                color={`${ApprovedColor} !important`}
              />

              <Text>
                creo que <span style={{ color: ApprovedColor }}>aprobaré</span>
              </Text>
            </Flex>
            <Flex
              alignItems="center"
              onClick={() => {
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
                color={`${FailedColor} !important`}
              />
              <Text>
                creo que <span style={{ color: FailedColor }}>reprobaré</span>
              </Text>
            </Flex>
          </Stack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
