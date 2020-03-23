import { toInteger } from "lodash";
import React, { FC, memo } from "react";
import { useForm } from "react-hook-form";

import { useMutation, useQuery } from "@apollo/react-hooks";
import {
  Box,
  Button,
  Checkbox,
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

import {
  FeedbackQuestionType,
  OPTIONS_FEEDBACK_SPLIT_CHAR,
} from "../../../constants";
import {
  ANSWER_FEEDBACK_FORM,
  UNANSWERED_FEEDBACK_FORM,
} from "../../graphql/queries";
import { useUser } from "../../utils/useUser";

export interface IDisclosure {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
}

export const Feedback: FC<{
  children?: FC<IDisclosure>;
}> = memo(({ children: Children }) => {
  const { user } = useUser();
  const { data, loading } = useQuery(UNANSWERED_FEEDBACK_FORM);
  const [answerFeedback] = useMutation(ANSWER_FEEDBACK_FORM);
  const modalDisclosure = useDisclosure(!!user?.admin);

  const { register, handleSubmit, errors, watch } = useForm();

  if (loading || !data?.unansweredForm) {
    return null;
  }

  const { id, name, questions } = data.unansweredForm;

  return (
    <>
      {Children && <Children {...modalDisclosure} />}

      <Modal {...modalDisclosure} preserveScrollBarGap>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{name}</ModalHeader>

          <ModalCloseButton />

          <ModalBody>
            <form
              onSubmit={handleSubmit(async (data) => {
                await answerFeedback({
                  variables: {
                    answer: {
                      form: id,
                      questions: Object.entries(data).map(
                        ([questionId, questionAnswer]) => {
                          const question = toInteger(questionId);
                          let answer: string = questionAnswer;
                          if (Array.isArray(questionAnswer)) {
                            answer = questionAnswer
                              .reduce<number[]>((acum, checked, optionId) => {
                                if (checked) {
                                  acum.push(optionId);
                                }
                                return acum;
                              }, [])
                              .join(OPTIONS_FEEDBACK_SPLIT_CHAR);
                          }
                          return {
                            question,
                            answer,
                          };
                        }
                      ),
                    },
                  },
                });
              })}
            >
              <Stack>
                {questions.map((questionValue) => {
                  return (
                    <Box key={questionValue.id} mt="10px" mb="10px" p="1px">
                      <Text>{questionValue.question}</Text>
                      {(() => {
                        const questionId = questionValue.id.toString();

                        switch (questionValue.type) {
                          case FeedbackQuestionType.OpenText: {
                            return (
                              <Input
                                name={questionId}
                                ref={register({
                                  required: {
                                    value: true,
                                    message: `Ingrese su opinión`,
                                  },
                                })}
                              />
                            );
                          }
                          case FeedbackQuestionType.SingleAnswer: {
                            return (
                              <RadioGroup name={questionId} key={questionId}>
                                {questionValue.options.map(
                                  (optionValue, index) => {
                                    return (
                                      <Radio
                                        key={index}
                                        value={optionValue.value.toString()}
                                        ref={register({
                                          required: {
                                            value: true,
                                            message: `Eliga una opción`,
                                          },
                                        })}
                                        lineHeight={0}
                                      >
                                        {optionValue.text}
                                      </Radio>
                                    );
                                  }
                                )}
                              </RadioGroup>
                            );
                          }
                          case FeedbackQuestionType.MultipleAnswer: {
                            return (
                              <Stack>
                                {questionValue.options.map((optionValue) => {
                                  return (
                                    <Checkbox
                                      className="checkbox"
                                      name={`${questionId}.${optionValue.value}`}
                                      key={optionValue.value}
                                      lineHeight={0}
                                      ref={register({
                                        validate: (checked: boolean) => {
                                          if (checked) {
                                            return true;
                                          }

                                          const checkedValues: boolean[] = watch(
                                            questionId,
                                            [] as any
                                          );
                                          return (
                                            checkedValues.some((v) => v) ||
                                            `Debe especificar al menos 1 opción`
                                          );
                                        },
                                      })}
                                    >
                                      {optionValue.text}
                                    </Checkbox>
                                  );
                                })}
                              </Stack>
                            );
                          }
                          default:
                            return null;
                        }
                      })()}

                      {errors[questionValue.id.toString()] &&
                        (Array.isArray(errors[questionValue.id.toString()]) ? (
                          <Text>
                            {errors[questionValue.id.toString()][0]?.message}
                          </Text>
                        ) : (
                          <Text>{errors[questionValue.id].message}</Text>
                        ))}
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
