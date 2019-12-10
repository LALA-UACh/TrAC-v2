import { truncate } from "lodash";
import { FC, useRef } from "react";
import { Manager, Popper, Reference } from "react-popper";
import ReactTooltip from "react-tooltip";
import { Divider, Progress } from "semantic-ui-react";

import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Icon,
  Stack,
  Tag,
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
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
        size="lg"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Dropout List</DrawerHeader>

          <DrawerBody overflowY="scroll">
            <Stack>
              {data.map(({ student_id, probability, accuracy }, key) => {
                let color: "red" | "yellow" | "green";
                if (probability > 80) {
                  color = "red";
                } else if (probability > 50) {
                  color = "yellow";
                } else {
                  color = "green";
                }
                return (
                  <Box key={key}>
                    {/* <Flex> */}
                    <Text>{student_id}</Text>
                    <Progress
                      percent={probability}
                      color={color}
                      data-tip={`Progreso ${"YY"}%, riesgo de abandono ${probability}%`}
                      data-for={`dropout_list_${key}`}
                    />
                    {/* </Flex> */}
                    {key + 1 !== data.length && <Divider />}

                    <ReactTooltip id={`dropout_list_${key}`} />
                  </Box>
                );
              })}
            </Stack>
          </DrawerBody>

          <DrawerFooter justifyContent="flex-start">
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
