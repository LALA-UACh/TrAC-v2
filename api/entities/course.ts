import { Field, Int, ObjectType } from "type-graphql";

import { DistributionValue } from "./distribution";

@ObjectType()
class Credit {
  @Field()
  label: string;

  @Field(() => Int)
  value: number;
}
@ObjectType()
export class Course {
  // program_structure => id
  @Field()
  id: number;

  // course => code, program_structure => code
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

  // ?? // TODO Distribution database definition
  @Field(() => [DistributionValue])
  historicalDistribution: DistributionValue[];
}
