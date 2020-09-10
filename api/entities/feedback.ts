import {
  Field,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from "type-graphql";

import { FeedbackQuestionType } from "../../client/constants";
import { User } from "./auth/user";

registerEnumType(FeedbackQuestionType, {
  name: "FeedbackQuestionType",
  description: "Type of question in a feedback form",
});

@ObjectType()
export class FeedbackQuestionOption {
  @Field()
  text: string;

  @Field(() => Int)
  value: number;
}

@ObjectType()
export class FeedbackQuestion {
  @Field(() => Int)
  id: number;

  @Field()
  question: string;

  @Field(() => FeedbackQuestionType)
  type: FeedbackQuestionType;

  @Field(() => Int)
  priority: number;

  @Field(() => [FeedbackQuestionOption])
  options: FeedbackQuestionOption[];
}

@ObjectType()
export class FeedbackForm {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Int)
  priority: number;

  @Field(() => [FeedbackQuestion])
  questions: FeedbackQuestion[];
}

@ObjectType()
export class FeedbackAnswer {
  @Field(() => FeedbackQuestion)
  question: FeedbackQuestion;

  @Field()
  answer: string;
}

@ObjectType()
export class FeedbackResult {
  @Field(() => FeedbackForm)
  form: FeedbackForm;

  @Field(() => [FeedbackAnswer])
  answers: FeedbackAnswer[];

  @Field(() => User)
  user: User;

  @Field()
  timestamp: Date;
}

@InputType()
export class FeedbackAnswerQuestionInput {
  @Field(() => Int)
  question: FeedbackAnswer["question"]["id"];

  @Field(() => String)
  answer: FeedbackAnswer["answer"];
}

@InputType()
export class FeedbackQuestionOptionInput {
  @Field()
  text: string;

  @Field(() => Int)
  value: number;
}

@InputType()
export class FeedbackAnswerInput {
  @Field(() => Int)
  form: FeedbackForm["id"];

  @Field(() => [FeedbackAnswerQuestionInput])
  questions: FeedbackAnswerQuestionInput[];
}
