import { FC, useCallback, useContext } from "react";
import { Button } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Text,
} from "@chakra-ui/core";

import { ConfigContext } from "../context/Config";

export const Help: FC = () => {
  const [isModalOpen, setIsModalOpen] = useRememberState(
    "TrAC_help_modal",
    true
  );

  const [isPopoverOpen, setPopoverOpen] = useRememberState(
    "TrAC_help_popover",
    true
  );

  const config = useContext(ConfigContext);

  const onModalOpen = useCallback(() => {
    setIsModalOpen(true);
  }, [setIsModalOpen]);

  const onModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, [setIsModalOpen]);

  const onHoverOpen = useCallback(() => {
    setPopoverOpen(true);
  }, [setPopoverOpen]);
  const onHoverClose = useCallback(() => {
    setPopoverOpen(false);
  }, [setPopoverOpen]);

  return (
    <>
      <Popover
        trigger="hover"
        isOpen={isPopoverOpen}
        onOpen={onHoverOpen}
        onClose={onHoverClose}
      >
        <PopoverTrigger>
          <Box>
            <Button
              color="teal"
              circular
              icon="help circle"
              onClick={onModalOpen}
            />
          </Box>
        </PopoverTrigger>
        <PopoverContent zIndex={1} width="fit-content" padding={3}>
          <PopoverArrow />
          {config.HELP_POPOVER_HOVER_TEXT}
        </PopoverContent>
      </Popover>
      <Modal
        isOpen={isModalOpen}
        onClose={onModalClose}
        size="90vw"
        preserveScrollBarGap
        scrollBehavior="inside"
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
