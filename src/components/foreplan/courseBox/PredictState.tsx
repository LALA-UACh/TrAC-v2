import React, { FC, useCallback, useMemo, useState } from "react";
import {
  IoMdCheckmarkCircle,
  IoMdCloseCircleOutline,
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
} from "@chakra-ui/core";

import { StateCourse } from "../../../../constants";
import { ICourse } from "../../../../interfaces";
import { ForeplanActiveStore } from "../../../context/ForeplanContext";

export const PredictState: FC<Pick<ICourse, "code" | "requisites">> = ({
  code,
  requisites,
}) => {
  const predictionState = ForeplanActiveStore.hooks.usePredictionState(code);
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);
  const onClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const Trigger = useMemo(() => {
    switch (predictionState) {
      case StateCourse.Passed: {
        return (
          <Text
            className="cursorPointer"
            fontSize="2em"
            fontWeight="bold"
            margin={0}
            background="green"
            marginTop={1}
            paddingLeft={1}
            paddingRight={1}
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
            background="red"
            marginTop={1}
            paddingLeft={1}
            paddingRight={1}
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
          >
            ?
          </Text>
        );
      }
    }
  }, [predictionState]);

  return (
    <Popover
      onClose={onClose}
      onOpen={onOpen}
      isOpen={isOpen}
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
            >
              <Box as={IoMdHelpCircle} size="1em" marginRight={2} />
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
            >
              <Box as={IoMdCheckmarkCircle} size="1em" marginRight={2} />
              <Text>creo que aprobaré</Text>
            </Flex>
            <Flex
              alignItems="center"
              onClick={() => {
                ForeplanActiveStore.actions.setCoursePrediction(
                  { code },
                  StateCourse.Failed
                );
              }}
            >
              <Box as={IoMdCloseCircleOutline} size="1em" marginRight={2} />
              <Text>creo que reprobaré</Text>
            </Flex>
          </Stack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
