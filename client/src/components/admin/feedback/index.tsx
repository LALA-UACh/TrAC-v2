import { format } from "date-fns-tz";
import { saveAs } from "file-saver";
import React, { FC, memo, useCallback } from "react";
import { useWindowSize } from "react-use";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { Button, Icon, Label } from "semantic-ui-react";

import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";

import { FeedbackQuestionType } from "../../../../constants";
import {
  useFeedbackResultsAdminQuery,
  useFeedbackResultsCsvAdminMutation,
} from "../../../graphql";

const dateFormatStringTemplate = "d MMMM yyyy HH:mm:ss (z)";

const ResultsModal: FC = memo(() => {
  const disclosure = useDisclosure();
  const { data, refetch, loading } = useFeedbackResultsAdminQuery({
    skip: !disclosure.isOpen,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const ResultRow = useCallback<FC<ListChildComponentProps>>(
    memo((props) => {
      if (!data) return null;

      const feedbackRowInfo = data.feedbackResults[props.index];
      if (!feedbackRowInfo) return null;

      return (
        <Stack
          style={props.style}
          border="1px solid black"
          p={2}
          isInline
          shouldWrapChildren
          flexWrap="wrap"
          alignItems="space-around"
          alignContent="space-around"
          justifyContent="space-around"
        >
          <Label>
            User
            <Label.Detail>{feedbackRowInfo.user.email}</Label.Detail>
          </Label>
          <Label>
            Form
            <Label.Detail>{feedbackRowInfo.form.name}</Label.Detail>
          </Label>
          <Label>
            Date
            <Label.Detail>
              {format(
                new Date(feedbackRowInfo.timestamp),
                dateFormatStringTemplate,
                {
                  timeZone: "America/Santiago",
                }
              )}
            </Label.Detail>
          </Label>
          {feedbackRowInfo.answers.map((answerValue, key) => {
            return (
              <Label key={key}>
                {answerValue.question.question}
                <Label.Detail>
                  {answerValue.question.type === FeedbackQuestionType.OpenText
                    ? answerValue.answer
                    : answerValue.question.options.map((optionValue) => {
                        return (
                          <span
                            key={optionValue.value}
                            className={
                              answerValue.answer === optionValue.text
                                ? "feedbackOptResult chosen"
                                : "feedbackOptResult"
                            }
                          >
                            {" |" + optionValue.text + "| "}
                          </span>
                        );
                      })}
                </Label.Detail>
              </Label>
            );
          })}
        </Stack>
      );
    }),
    [data]
  );

  const { width } = useWindowSize();

  return (
    <>
      <Button onClick={disclosure.onOpen} icon labelPosition="left" primary>
        <Icon name="comment alternate outline" />
        Check Results
      </Button>
      <Modal
        onClose={disclosure.onClose}
        isOpen={disclosure.isOpen}
        size="fit-content"
        blockScrollOnMount
        preserveScrollBarGap
        scrollBehavior="inside"
      >
        <ModalOverlay width="100%" height="100%" />
        <ModalContent>
          <ModalCloseButton backgroundColor="white" />
          <ModalHeader>
            Feedback Results{" "}
            <Icon
              className="cursorPointer"
              disabled={loading}
              loading={loading}
              name="refresh"
              onClick={() => refetch()}
            />
          </ModalHeader>
          <ModalBody>
            <Stack>
              {(data?.feedbackResults.length ?? 1) === 0 ? (
                <Box>No feedback results available</Box>
              ) : (
                <Box>
                  <FixedSizeList
                    height={400}
                    width={Math.min(width - 50, 700)}
                    itemCount={data?.feedbackResults.length ?? 0}
                    itemSize={140}
                  >
                    {ResultRow}
                  </FixedSizeList>
                </Box>
              )}
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
});

export const AdminFeedback: FC = () => {
  const [
    getResultsCsv,
    { loading: loadingResultsCsv },
  ] = useFeedbackResultsCsvAdminMutation();

  const onDownloadClick = useCallback(async () => {
    const result = await getResultsCsv();
    if (!result.data) return;

    const dateNow = format(Date.now(), dateFormatStringTemplate, {
      timeZone: "America/Santiago",
    });
    saveAs(
      new Blob(["\uFEFF" + result.data.feedbackResultsCsv], {
        type: "text/csv;charset=UTF-8",
      }),
      `Feedback Results-${dateNow} | LALA TrAC.csv`,
      {
        autoBom: false,
      }
    );
  }, [getResultsCsv]);
  return (
    <Stack alignItems="center">
      <Box>
        <Button
          icon
          labelPosition="left"
          color="green"
          loading={loadingResultsCsv}
          disabled={loadingResultsCsv}
          onClick={onDownloadClick}
        >
          <Icon name="download" />
          Download Feedback Results (CSV)
        </Button>
      </Box>
      <Box>
        <ResultsModal />
      </Box>
    </Stack>
  );
};
