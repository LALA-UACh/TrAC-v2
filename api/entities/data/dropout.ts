import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class Dropout {
  @Field({ nullable: true })
  prob_dropout?: number;

  @Field({ nullable: true })
  model_accuracy?: number;

  @Field()
  active: boolean;

  @Field({ nullable: true })
  explanation?: string;
}
