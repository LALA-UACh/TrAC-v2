import { AnimatePresence, motion } from "framer-motion";
import { FC, memo, useContext, useEffect, useState } from "react";

import { Flex, Stack, Text } from "@chakra-ui/core";
import { TrackingContext } from "@components/Tracking";
import {
  DROPOUT_BACKGROUND_COLOR,
  DROPOUT_PREDICTION,
  DROPOUT_PREDICTION_ACCURACY,
  DROPOUT_PREDICTION_DESCRIPTION,
  DROPOUT_TEXT_COLOR,
} from "@constants";

export const Dropout: FC<{ probability: number; accuracy: number }> = memo(
  ({ probability, accuracy }) => {
    const [show, setShow] = useState(false);

    const Tracking = useContext(TrackingContext);
    useEffect(() => {
      Tracking.current.showingPrediction = show;
    }, [show]);

    return (
      <Flex alignItems="center">
        <Flex
          backgroundColor={DROPOUT_BACKGROUND_COLOR}
          boxShadow={
            show
              ? "0px 0px 2px 1px rgb(174,174,174)"
              : "2px 3px 2px 1px rgb(174,174,174)"
          }
          borderRadius={show ? "5px 5px 5px 5px" : "0px 5px 5px 0px"}
          alignItems="center"
          onClick={() => {
            setShow(show => !show);

            Tracking.current.track({
              action: "click",
              effect: show ? "close-dropout" : "open-dropout",
              target: "dropout",
            });
          }}
          color={DROPOUT_TEXT_COLOR}
          cursor="pointer"
          transition="0.4s box-shadow ease-in-out"
        >
          <Stack className="unselectable" isInline pt={10} pb={10}>
            <Text
              minWidth="55px"
              height="120px"
              m={0}
              ml={4}
              textAlign="center"
              fontWeight="bold"
              className="verticalText"
              fontSize="1.2em"
            >
              {DROPOUT_PREDICTION}
            </Text>
            <AnimatePresence>
              {show && (
                <motion.div
                  key="dropout-text"
                  initial={{
                    opacity: 0,
                  }}
                  animate={{ opacity: 1 }}
                  exit={{
                    opacity: 0,
                  }}
                >
                  <Text width="290px" pl={5} pb={0} mb={0}>
                    {DROPOUT_PREDICTION_DESCRIPTION}
                  </Text>
                  <Text fontSize="2.5em" fontWeight="bold" ml={5} mb={0}>
                    {probability}%
                  </Text>
                  <Text ml={5}>
                    ({DROPOUT_PREDICTION_ACCURACY} <b>{accuracy}</b>)
                  </Text>
                </motion.div>
              )}
            </AnimatePresence>
          </Stack>
        </Flex>
      </Flex>
    );
  }
);
