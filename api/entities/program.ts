import { Field, Int, ObjectType } from "type-graphql";

import { Course } from "./course";

@ObjectType()
export class Semester {
  // program_structure => semester
  @Field(() => Int)
  id: number;

  // program_structure => code
  @Field(() => [Course])
  courses: Course[];
}
@ObjectType()
export class Curriculum {
  // program_structure => curriculum
  @Field(() => Int)
  id: number;

  @Field(() => [Semester])
  semesters: Semester[];
}
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

  // program_structure => curriculum
  @Field(() => [Curriculum])
  curriculums: Curriculum[];
}
