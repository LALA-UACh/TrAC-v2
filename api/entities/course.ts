import { Field, Int, ObjectType } from "type-graphql";

import { DistributionValue } from "./distribution";

@ObjectType()
export class Course {
  // course => code, program_structure => code
  @Field()
  code: string;

  // course => name
  @Field()
  name: string;

  // program_structure => credits
  @Field(() => Int)
  credits: number;

  // program_structure => mention
  @Field()
  mention: string;

  @Field(() => Int)
  // program_structure => semester
  semester: number; // 1-11 | semester where this course belongs in it's curriculum

  // program_structure => requisites
  @Field()
  requisitesRaw: string;

  // LOGIC => program_structure => requisites
  @Field(() => [Course])
  flow: Course[];

  // LOGIC => program_structure => requisites
  @Field(() => [Course])
  requisites: Course[];

  // ?? // TODO Distribution database definition
  @Field(() => [DistributionValue])
  historicalDistribution: DistributionValue[];
}
