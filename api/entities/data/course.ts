import { Field, Int, ObjectType } from "type-graphql";

import { BandColor, DistributionValue } from "./distribution";

@ObjectType()
class Credit {
  @Field()
  label: string;

  @Field(() => Int)
  value: number;
}
@ObjectType({ simpleResolvers: true })
export class Course {
  // program_structure => id
  @Field(() => Int, { description: "Course-Semester-Curriculum-Program ID " })
  id: number;

  // course => id, program_structure => course_id
  @Field()
  code: string;

  // course => name
  @Field()
  name: string;

  // program_structure => credits | creditsSCT
  @Field(() => [Credit])
  credits: Credit[];

  // program_structure => mention
  @Field()
  mention: string;

  // LOGIC => program_structure => requisites
  @Field(() => [Course])
  flow: Course[];

  // LOGIC => program_structure => requisites
  @Field(() => [Course])
  requisites: Course[];

  // course_stats => histogram , histogram_labels
  @Field(() => [DistributionValue])
  historicalDistribution: DistributionValue[];

  // LOGIC, CHOOSE ACCORDINGLY => course_stats => color_bands
  @Field(() => [BandColor])
  bandColors: BandColor[];
}
