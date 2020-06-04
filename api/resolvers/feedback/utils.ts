import type { FeedbackQuestionOption } from "../../entities/feedback";

import { toInteger } from "lodash";

import {
  OPTIONS_FEEDBACK_SPLIT_CHAR,
  OPTIONS_FEEDBACK_VALUE_SPLIT_CHAR,
} from "../../../constants";

export function splitFeedbackQuestionOptions(
  options: string
): FeedbackQuestionOption[] {
  return options
    .split(OPTIONS_FEEDBACK_SPLIT_CHAR)
    .filter((v) => v.trim())
    .map((optionValue) => {
      const [numberValueStr, ...textValue] = optionValue
        .trim()
        .split(OPTIONS_FEEDBACK_VALUE_SPLIT_CHAR);

      const textStr = textValue.join(OPTIONS_FEEDBACK_VALUE_SPLIT_CHAR);

      return {
        value: toInteger(numberValueStr),
        text: textStr.slice(1, textStr.length - 1),
      };
    });
}

export function joinFeedbackQuestionOptions(
  questionsOptions: FeedbackQuestionOption[]
): string {
  return questionsOptions
    .map((optionValue) => {
      return `${
        optionValue.value
      }${OPTIONS_FEEDBACK_VALUE_SPLIT_CHAR}"${optionValue.text.trim()}"`;
    })
    .join(OPTIONS_FEEDBACK_SPLIT_CHAR);
}
