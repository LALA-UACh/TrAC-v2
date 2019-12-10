import { truncate } from "lodash";
import { FC, useRef } from "react";
import { Divider } from "semantic-ui-react";

import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Icon,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/core";

export const DropoutList: FC<{
  data: { student_id: string; probability: number; accuracy: number }[];
}> = ({ data }) => {
  const { isOpen, onOpen, onClose } = useDisclosure(false);
  const btnRef = useRef<HTMLElement>(null);
  return (
    <>
      <Button m={2} ref={btnRef} variantColor="blue" onClick={onOpen}>
        Dropout List
      </Button>
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        finalFocusRef={btnRef}
        size="lg"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Dropout List</DrawerHeader>

          <DrawerBody overflowY="scroll">
            <Stack>
              {data.map((value, key) => {
                return (
                  <Box key={key}>
                    <Text>{truncate(value.student_id, { length: 25 })}</Text>
                    <Text>{value.probability}%</Text>
                    <Text>{value.accuracy}</Text>
                    {key + 1 !== data.length && <Divider />}
                  </Box>
                );
              })}
            </Stack>
          </DrawerBody>

          <DrawerFooter>
            <Icon
              name={isOpen ? "chevron-left" : "chevron-right"}
              size="35px"
              onClick={onClose}
              cursor="pointer"
            />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};
