import { Field, ID, ObjectType } from "type-graphql";

import { Program } from "./program";

@ObjectType()
export class Student {
  @Field(() => ID)
  id: string;

  @Field()
  program: Program;

  @Field()
  curriculum: string;

  @Field()
  start_year: number;

  @Field()
  mention: string;
}
