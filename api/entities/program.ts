import { Field, Int, ObjectType } from "type-graphql";

import { Course } from "./course";

@ObjectType()
export class Program {
  // program => id
  @Field(() => Int)
  id: number;

  // program => name
  @Field()
  name: string;

  // program => desc
  @Field()
  desc: string;

  // program => state
  @Field()
  state: string;

  // program_structure => *
  @Field(() => [Course])
  courses: Course[];
}
