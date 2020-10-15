import React, { FC, useCallback, useContext } from "react";
import { Button } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/core";

import { ConfigContext } from "../context/Config";

export const Help: FC = () => {
  const [isModalOpen, setIsModalOpen] = useRememberState(
    "TrAC_help_modal",
    true
  );

  const config = useContext(ConfigContext);

  const onModalOpen = useCallback(() => {
    setIsModalOpen(true);
  }, [setIsModalOpen]);

  const onModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, [setIsModalOpen]);

  return (
    <>
      <Tooltip
        aria-label={config.HELP_POPOVER_HOVER_TEXT}
        label={config.HELP_POPOVER_HOVER_TEXT}
        background="white"
        color="black"
        padding="10px"
        fontSize="1.5em"
        hasArrow
        shouldWrapChildren
      >
        <Button
          color="teal"
          circular
          icon="help circle"
          onClick={onModalOpen}
        />
      </Tooltip>

      <Modal
        isOpen={isModalOpen}
        onClose={onModalClose}
        size="90vw"
        preserveScrollBarGap
        scrollBehavior="inside"
        blockScrollOnMount
      >
        <ModalOverlay />

        <ModalContent padding="10px">
          <ModalHeader textAlign="center">
            <Text>{config.HELP_MODAL_HEADER_TEXT}</Text>
          </ModalHeader>
          <ModalCloseButton backgroundColor="white" borderRadius="10px" />

          <ModalBody>
            <Stack
              alignItems="center"
              shouldWrapChildren
              className="helpImagesStack"
            >
              <img src="/image_placeholder.png" />
              <img src="/image_placeholder.png" />
              <img src="/image_placeholder.png" />
              <img src="/image_placeholder.png" />
              <img src="/image_placeholder.png" />
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
