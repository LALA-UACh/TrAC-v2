import { toInteger } from "lodash";
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";

import { IContext } from "../../interfaces";
import {
  FeedbackFormQuestionTable,
  FeedbackFormTable,
  FeedbackResultTable,
} from "../db/tables";
import {
  FeedbackAnswerInput,
  FeedbackForm,
  FeedbackQuestionOption,
} from "../entities/feedback";
import { assertIsDefined } from "../utils/assert";

const optionsSplitChar = "|";

const optionsValueSplitChar = "=";

export function splitFeedbackQuestionOptions(
  options: string
): FeedbackQuestionOption[] {
  return options.split(optionsSplitChar).map(optionValue => {
    const [numberValueStr, ...textValue] = optionValue.split(
      optionsValueSplitChar
    );

    return {
      value: toInteger(numberValueStr),
      text: textValue.join(optionsValueSplitChar),
    };
  });
}

export function joinFeedbackQuestionOptions(
  questionsOptions: FeedbackQuestionOption[]
): string {
  return questionsOptions
    .map(optionValue => {
      return `${optionValue.value}${optionsValueSplitChar}${optionValue.text}`;
    })
    .join(optionsSplitChar);
}

@Resolver(() => FeedbackForm)
export class FeedbackFormResolver {
  @Authorized()
  @Query(() => FeedbackForm, { nullable: true })
  async getUnansweredForm(
    @Ctx() { user }: IContext
  ): Promise<FeedbackForm | null> {
    assertIsDefined(user, "Context auth is not working propertly");

    const answeredForms = await FeedbackResultTable()
      .distinct("form_id")
      .where({
        user_id: user.email,
      });

    const firstNotAnsweredForm = await FeedbackFormTable()
      .select("*")
      .whereNotIn(
        "id",
        answeredForms.map(({ form_id }) => form_id)
      )
      .orderBy("priority", "desc")
      .first();

    if (firstNotAnsweredForm) {
      const formQuestions = await FeedbackFormQuestionTable()
        .select("id", "question", "type", "priority", "options")
        .where({
          form_id: firstNotAnsweredForm.id,
        })
        .orderBy("priority", "desc");

      return {
        id: firstNotAnsweredForm.id,
        name: firstNotAnsweredForm.name,
        priority: firstNotAnsweredForm.priority,
        questions: formQuestions.map(questionValue => {
          return {
            id: questionValue.id,
            question: questionValue.question,
            type: questionValue.type,
            priority: questionValue.priority,
            options: splitFeedbackQuestionOptions(questionValue.options),
          };
        }),
      };
    }

    return null;
  }

  @Authorized()
  @Mutation(() => Boolean)
  async answerFeedbackForm(@Arg("answer") answer: FeedbackAnswerInput) {
    return true;
  }
}
