import React, { FC, memo } from "react";
import { useForm } from "react-hook-form";

import {
  Box,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/core";

export interface IDisclosure {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
}

const feedbackData: { name: string; options?: string[] }[] = [
  {
    name: "first_question",
    options: ["uno", "dos", "tres", "cuatro", "cinco"],
  },
  {
    name: "second_question",
    options: ["uno", "dos", "tres", "cuatro", "cinco"],
  },
  {
    name: "third_question",
    options: ["uno", "dos", "tres", "cuatro", "cinco"],
  },
  {
    name: "free_question",
  },
];

export const Feedback: FC<{
  children: FC<IDisclosure>;
}> = memo(({ children: Children }) => {
  const modalDisclosure = useDisclosure(false);

  const { register, handleSubmit, errors } = useForm();

  console.log({
    errors,
  });
  return (
    <>
      <Children {...modalDisclosure} />
      <Modal {...modalDisclosure} preserveScrollBarGap>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Feedback</ModalHeader>

          <ModalCloseButton />

          <ModalBody>
            <form
              onSubmit={handleSubmit((data) => {
                console.log({
                  data,
                });
              })}
            >
              <Stack>
                {feedbackData.map((value, key) => {
                  return (
                    <Box key={key} mt="10px" mb="10px" p="1px">
                      <Text>{value.name}</Text>
                      {value.options ? (
                        <RadioGroup name={value.name}>
                          {value.options.map((optionValue, key) => {
                            return (
                              <Radio
                                key={key}
                                value={optionValue}
                                ref={register({
                                  required: {
                                    value: true,
                                    message: `${value.name} is required`,
                                  },
                                })}
                              >
                                {optionValue}
                              </Radio>
                            );
                          })}
                        </RadioGroup>
                      ) : (
                        <Input
                          key={key}
                          name={value.name}
                          ref={register({ required: true })}
                        />
                      )}
                      {errors[value.name] && (
                        <Text>{errors[value.name].message}</Text>
                      )}
                    </Box>
                  );
                })}

                <Button type="submit">OK</Button>
              </Stack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
});
