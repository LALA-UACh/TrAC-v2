import { Field, ID, Int, ObjectType } from "type-graphql";

import { Dropout } from "./dropout";
import { Program } from "./program";
import { Term } from "./term";

@ObjectType()
export class Student {
  // student_program => student_id
  @Field(() => ID)
  id: string;

  // student_program => program_id
  @Field()
  program: Program;

  // student_program => curriculum
  @Field(() => Int)
  curriculum: number;

  // student_program => start_year
  @Field(() => Int)
  start_year: number;

  // student_program => mention
  @Field()
  mention: string;

  // student_term
  @Field(() => [Term])
  terms: Term[];

  // student_dropout
  @Field({ nullable: true })
  dropout?: Dropout;
}
