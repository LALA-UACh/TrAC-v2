import { Parser } from "json2csv";
import { assign, reduce, toInteger } from "lodash";
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";

import {
  FeedbackQuestionType,
  NO_ANSWER,
  OPTIONS_FEEDBACK_SPLIT_CHAR,
  OPTIONS_FEEDBACK_VALUE_SPLIT_CHAR,
} from "../../constants";
import { IContext } from "../../interfaces";
import { ADMIN } from "../constants";
import {
  FeedbackFormQuestionTable,
  FeedbackFormTable,
  FeedbackResultTable,
  IFeedbackForm,
  IFeedbackFormQuestion,
  IFeedbackResult,
} from "../db/tables";
import {
  FeedbackAnswer,
  FeedbackAnswerInput,
  FeedbackForm,
  FeedbackQuestion,
  FeedbackQuestionOption,
  FeedbackResult,
} from "../entities/feedback";
import { assertIsDefined } from "../utils/assert";
import { PartialUser } from "./auth/user";

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

type PartialFeedbackResult = Pick<
  FeedbackResult,
  "answers" | "form" | "timestamp"
> & {
  user: PartialUser;
};

@Resolver(() => FeedbackForm)
export class FeedbackFormResolver {
  @Authorized()
  @Query(() => FeedbackForm, { nullable: true })
  async unansweredForm(
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
        questions: formQuestions.map(({ options, ...restQuestion }) => {
          return {
            ...restQuestion,
            options: splitFeedbackQuestionOptions(options),
          };
        }),
      };
    }

    return null;
  }

  @Authorized()
  @Mutation(() => Boolean)
  async answerFeedbackForm(
    @Ctx() { user }: IContext,
    @Arg("answer") feedbackAnswerInput: FeedbackAnswerInput
  ) {
    assertIsDefined(user, "Authorization context not working properly");

    try {
      const [form, questions] = await Promise.all([
        FeedbackFormTable()
          .select("id")
          .where({
            id: feedbackAnswerInput.form,
          })
          .first(),
        FeedbackFormQuestionTable()
          .select("id", "options", "type")
          .whereIn(
            "id",
            feedbackAnswerInput.questions.map(({ question }) => question)
          ),
      ]);

      if (form && questions?.length) {
        const feedbackAnswers: Pick<
          IFeedbackResult,
          "answer" | "form_id" | "question_id" | "user_id"
        >[] = questions.map((questionDbValue) => {
          return {
            form_id: form.id,
            question_id: questionDbValue.id,
            user_id: user.email,
            answer:
              feedbackAnswerInput.questions.find((questionFeedbackValue) => {
                if (questionFeedbackValue.question === questionDbValue.id) {
                  if (questionDbValue.type === FeedbackQuestionType.OpenText) {
                    return true;
                  } else if (
                    questionDbValue.type === FeedbackQuestionType.SingleAnswer
                  ) {
                    const options = splitFeedbackQuestionOptions(
                      questionDbValue.options
                    );

                    const answerValue = toInteger(questionFeedbackValue.answer);
                    return options.some((feedbackQuestionOption) => {
                      return feedbackQuestionOption.value === answerValue;
                    });
                  } else {
                    const questionOptions = splitFeedbackQuestionOptions(
                      questionDbValue.options
                    ).map((opt) => opt.value);

                    const answerValueArray = questionFeedbackValue.answer
                      .split(OPTIONS_FEEDBACK_SPLIT_CHAR)
                      .map(toInteger);

                    return answerValueArray.every((answerValue) => {
                      return questionOptions.includes(answerValue);
                    });
                  }
                }

                return;
              })?.answer || NO_ANSWER,
          };
        });

        await FeedbackResultTable().insert(feedbackAnswers);

        return true;
      }
    } catch (err) {
      console.error(err);
    }

    return false;
  }

  @Authorized([ADMIN])
  @Query(() => [FeedbackResult])
  async feedbackResults(
    @Arg("user_ids", () => [String], { nullable: true }) user_ids?: string[]
  ): Promise<PartialFeedbackResult[]> {
    const [allFeedbackAnswers, allForms, allQuestions] = await Promise.all([
      user_ids
        ? FeedbackResultTable().select("*").whereIn("user_id", user_ids)
        : FeedbackResultTable().select("*"),
      FeedbackFormTable().select("*"),
      FeedbackFormQuestionTable().select("*"),
    ]);

    const questionsHashByForm = hashQuestionsByForm(allQuestions);

    const formsHashById = hashFormsById(allForms, questionsHashByForm);

    const feedbackAnswersHashByUser = hashAnswersByUser(
      allFeedbackAnswers,
      formsHashById
    );

    return reduce(
      feedbackAnswersHashByUser,
      (acum, resultsHashByForm, userEmail) => {
        for (const { result, form } of Object.values(resultsHashByForm)) {
          const formQuestions = hashAndListFormQuestions(form.questions);

          acum.push({
            form: {
              id: form.id,
              name: form.name,
              priority: form.priority,
              questions: formQuestions.array,
            },
            answers: transformResultAnswers(result, formQuestions),

            user: {
              email: userEmail,
            },
            timestamp: result[0]?.timestamp ?? new Date(),
          });
        }

        return acum;
      },
      [] as PartialFeedbackResult[]
    );
  }

  @Authorized([ADMIN])
  @Mutation(() => String)
  async feedbackResultsCsv() {
    const [allFeedbackAnswers, allForms, allQuestions] = await Promise.all([
      FeedbackResultTable().select("*"),
      FeedbackFormTable().select("*").orderBy("priority", "desc"),
      FeedbackFormQuestionTable().select("*").orderBy("priority", "desc"),
    ]);

    const questionsByForm = hashQuestionsByForm(allQuestions);
    const formsById = hashFormsById(allForms, questionsByForm);

    const memoQuestionsInfo: Record<number | string, FeedbackQuestion> = {};

    const resultListForCsv = allFeedbackAnswers.reduce<
      FeedbackResultCsvParse[]
    >((acum, { form_id, question_id, user_id, answer }) => {
      const formInfo = formsById[form_id];
      if (!formInfo) return acum;

      if (!(question_id in memoQuestionsInfo)) {
        assign(
          memoQuestionsInfo,
          hashAndListFormQuestions(formInfo.questions, false).hash
        );
      }

      const questionInfo = memoQuestionsInfo[question_id];
      if (!questionInfo) return acum;

      switch (questionInfo.type) {
        case FeedbackQuestionType.SingleAnswer: {
          answer = parseSingleAnswerQuestionResult(
            answer,
            questionInfo.options
          );
          break;
        }
        case FeedbackQuestionType.MultipleAnswer: {
          answer = parseMultipleAnswerQuestionResult(
            answer,
            questionInfo.options
          );
          break;
        }
      }
      acum.push({
        user_id,
        form: formInfo.name,
        question: questionInfo.question,
        answer,
      });

      return acum;
    }, []);

    return FeedbackParser.parse(resultListForCsv);
  }
}

type FeedbackResultCsvParse = {
  user_id: string;
  form: string;
  question: string;
  answer: string;
};

const FeedbackParser = new Parser<FeedbackResultCsvParse>({
  fields: [
    {
      label: "User",
      value: "user_id",
    },
    {
      label: "Form",
      value: "form",
    },
    {
      label: "Question",
      value: "question",
    },
    {
      label: "Answer",
      value: "answer",
    },
  ],
});

function hashQuestionsByForm(allQuestions: IFeedbackFormQuestion[]) {
  return allQuestions.reduce<Record<number, IFeedbackFormQuestion[]>>(
    (acum, value) => {
      if (value.form_id in acum) {
        acum[value.form_id].push(value);
      } else {
        acum[value.form_id] = [value];
      }
      return acum;
    },
    {}
  );
}

function hashFormsById(
  allForms: IFeedbackForm[],
  questionsHash: ReturnType<typeof hashQuestionsByForm>
) {
  return allForms.reduce<
    Record<number, IFeedbackForm & { questions: IFeedbackFormQuestion[] }>
  >((acum, value) => {
    acum[value.id] = {
      ...value,
      questions: questionsHash[value.id] ?? [],
    };
    return acum;
  }, {});
}

function hashAnswersByUser(
  allFeedbackAnswers: IFeedbackResult[],
  formsHashById: ReturnType<typeof hashFormsById>
) {
  return allFeedbackAnswers.reduce<
    Record<
      string,
      Record<
        string,
        {
          result: IFeedbackResult[];
          form: typeof formsHashById[number];
        }
      >
    >
  >((acum, resultValue) => {
    const { form_id, user_id } = resultValue;
    const form = formsHashById[form_id];
    if (!form) return acum;

    if (user_id in acum) {
      if (form_id in acum[user_id]) {
        acum[user_id][form_id].result.push(resultValue);
      } else {
        acum[user_id][form_id] = { result: [resultValue], form };
      }
    } else {
      acum[user_id] = { [form_id]: { result: [resultValue], form } };
    }

    return acum;
  }, {});
}

function hashAndListFormQuestions(
  questions: IFeedbackFormQuestion[],
  doArray = true
) {
  return questions.reduce<{
    array: FeedbackQuestion[];
    hash: Record<string, FeedbackQuestion>;
  }>(
    (acum, { options, ...restQuestionValue }) => {
      const question = {
        ...restQuestionValue,
        options:
          restQuestionValue.type !== FeedbackQuestionType.OpenText
            ? splitFeedbackQuestionOptions(options)
            : [],
      };

      if (doArray) acum.array.push(question);

      acum.hash[question.id] = question;

      return acum;
    },
    {
      array: [],
      hash: {},
    }
  );
}

function transformResultAnswers(
  result: IFeedbackResult[],
  formQuestions: ReturnType<typeof hashAndListFormQuestions>
) {
  return result.reduce<FeedbackAnswer[]>((acum, resultValue) => {
    const resultQuestion = formQuestions.hash[resultValue.question_id];

    if (resultQuestion) {
      let answer: string;
      switch (resultQuestion.type) {
        case FeedbackQuestionType.MultipleAnswer: {
          answer = parseMultipleAnswerQuestionResult(
            resultValue.answer,
            resultQuestion.options
          );
          break;
        }
        case FeedbackQuestionType.SingleAnswer: {
          answer = parseSingleAnswerQuestionResult(
            resultValue.answer,
            resultQuestion.options
          );
          break;
        }
        case FeedbackQuestionType.OpenText:
        default: {
          answer = resultValue.answer;
          break;
        }
      }
      acum.push({
        question: resultQuestion,
        answer,
      });
    }

    return acum;
  }, []);
}

function parseSingleAnswerQuestionResult(
  answer: string,
  options: FeedbackQuestionOption[]
) {
  const intAnswer = toInteger(answer);
  return (
    options.find((option) => {
      return option.value === intAnswer;
    })?.text ?? answer
  );
}

function parseMultipleAnswerQuestionResult(
  answer: string,
  options: FeedbackQuestionOption[]
) {
  return answer
    .split(OPTIONS_FEEDBACK_SPLIT_CHAR)
    .map((optionAnswerValue) => {
      const intOptionAnswerValue = toInteger(optionAnswerValue);
      return (
        options.find((option) => {
          return option.value === intOptionAnswerValue;
        })?.text ?? optionAnswerValue
      );
    })
    .join(OPTIONS_FEEDBACK_SPLIT_CHAR);
}
