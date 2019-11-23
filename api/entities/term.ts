import { Field, ID, Int, ObjectType } from "type-graphql";

import { TakenCourse } from "./takenCourse";

@ObjectType()
export class Term {
  // student_term => id
  @Field(() => ID)
  id: string;

  // student_term => student_id
  @Field()
  student_id: string;

  // student_term => year
  @Field(() => Int)
  year: number;

  // student_term => semester
  @Field(() => Int)
  semester: number; // 1-2 | first or second semester of the year

  // student_term => situation
  @Field()
  situation: string;

  // student_term => ? // TODO Term PSP database definition
  @Field()
  PSP: number;

  // student_term => ?  // TODO Term PGA database definition
  @Field()
  PGA: number;

  // ?? // TODO Term ProgramPGA database definition
  @Field()
  ProgramPGA: number;

  // student_course => *
  @Field(() => [TakenCourse])
  takenCourses: TakenCourse[];
}
