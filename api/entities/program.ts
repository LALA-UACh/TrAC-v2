import { Field, Int, ObjectType } from "type-graphql";

import { Course } from "./course";

@ObjectType()
export class Semester {
  // program_structure => semester
  @Field(() => Int)
  id: number;

  // program_structure => course_id
  @Field(() => [Course])
  courses: Course[];
}
@ObjectType()
export class Curriculum {
  // program_structure => curriculum
  @Field()
  id: string;

  // program_structure => semester
  @Field(() => [Semester])
  semesters: Semester[];
}
@ObjectType()
export class Program {
  // program => id
  @Field()
  id: string;

  // program => name
  @Field()
  name: string;

  // program => desc
  @Field()
  desc: string;

  // program => active
  @Field()
  active: boolean;

  // program => last_gpa
  @Field()
  lastGPA: number;

  // program_structure => curriculum
  @Field(() => [Curriculum])
  curriculums: Curriculum[];
}
