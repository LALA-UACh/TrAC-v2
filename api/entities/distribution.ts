import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class DistributionValue {
  // ?? // TODO Distribution database definition
  @Field(() => Int)
  min: number;

  // ?? // TODO Distribution database definition
  @Field(() => Int)
  max: number;

  // ? // TODO Distribution database definition
  @Field(() => Int)
  value: number;
}
