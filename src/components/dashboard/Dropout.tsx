import { AnimatePresence, motion } from "framer-motion";
import React, { FC, memo, useContext, useEffect, useState } from "react";

import { Flex, Stack, Text } from "@chakra-ui/core";

import { ConfigContext } from "../../context/Config";
import { setTrackingData, track } from "../../context/Tracking";

export const Dropout: FC<{
  probability?: number | null;
  accuracy?: number | null;
}> = memo(({ probability, accuracy }) => {
  const {
    DROPOUT_BACKGROUND_COLOR,
    DROPOUT_PREDICTION,
    DROPOUT_PREDICTION_ACCURACY,
    DROPOUT_PREDICTION_DESCRIPTION,
    DROPOUT_TEXT_COLOR,
    DROPOUT_PREDICTION_ACCURACY_ENABLED,
  } = useContext(ConfigContext);

  const [show, setShow] = useState(false);

  useEffect(() => {
    setTrackingData({
      showingPrediction: show,
    });
  }, [show]);

  if (probability == null) return null;

  return (
    <Flex alignItems="center" ml="1em">
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
          setShow((show) => !show);

          track({
            action: "click",
            effect: show ? "close-dropout" : "open-dropout",
            target: "dropout",
          });
        }}
        color={DROPOUT_TEXT_COLOR}
        cursor="pointer"
        transition="box-shadow 0.4s ease-in-out"
      >
        <Stack className="unselectable" isInline pt={10} pb={10}>
          <Text
            minWidth="55px"
            height="120px"
            m={0}
            ml={4}
            textAlign="center"
            fontWeight="bold"
            fontFamily="Lato"
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
                <Text width="290px" pl={5} pb={0} mb={0} fontFamily="Lato">
                  {DROPOUT_PREDICTION_DESCRIPTION}
                </Text>
                <Text
                  fontSize="2.5em"
                  fontWeight="bold"
                  ml={5}
                  mb={0}
                  fontFamily="Lato"
                >
                  {probability}
                </Text>
                {DROPOUT_PREDICTION_ACCURACY_ENABLED && (
                  <Text ml={5} fontFamily="Lato">
                    ({DROPOUT_PREDICTION_ACCURACY} <b>{accuracy ?? "-"}</b>)
                  </Text>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Stack>
      </Flex>
    </Flex>
  );
});

export default Dropout;
