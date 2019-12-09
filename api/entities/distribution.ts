import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class DistributionValue {
  // course_stats => histogram_labels
  @Field()
  label: string;

  // course_stats => histogram
  @Field(() => Int)
  value: number;

  // LOGIC, CHOOSE ACCORDINGLY => course_stats => color_bands
  @Field()
  color: string;
}
