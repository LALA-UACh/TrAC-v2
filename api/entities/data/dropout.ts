import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class Dropout {
  @Field()
  prob_dropout: number;

  @Field()
  model_accuracy: number;

  @Field()
  active: boolean;
}
