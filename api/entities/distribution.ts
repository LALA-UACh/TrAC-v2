import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class BandColor {
  // course_stats => color_bands
  @Field()
  min: number;

  // course_stats => color_bands
  @Field()
  max: number;

  // course_stats => color_bands
  @Field()
  color: string;
}

@ObjectType()
export class DistributionValue {
  // course_stats => histogram_labels
  @Field()
  label: string;

  // course_stats => histogram
  @Field(() => Int)
  value: number;
}
