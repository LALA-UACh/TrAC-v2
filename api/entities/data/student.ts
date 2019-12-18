import { Field, ID, Int, ObjectType } from "type-graphql";

import { Dropout } from "./dropout";
import { Program } from "./program";
import { Term } from "./term";

@ObjectType({ simpleResolvers: true })
export class Student {
  // student_program => student_id | student => id
  @Field(() => ID)
  id: string;

  // student => name
  @Field()
  name: string;

  // student => state
  @Field()
  state: string;

  // student_term => distinct(program_id)
  @Field(() => [Program])
  programs: Program[];

  // student_term => distinct(curriculum)
  @Field(() => [String])
  curriculums: string[];

  // LOGIC LOWEST => student_term => start_year
  @Field(() => Int)
  start_year: number;

  // LOGIC LATEST student_program => mention
  @Field()
  mention: string;

  // LOGIC LATEST student_program => completion
  @Field()
  progress: number;

  // student_term
  @Field(() => [Term])
  terms: Term[];

  // student_dropout
  @Field({ nullable: true })
  dropout?: Dropout;
}
