import { Field, Int, ObjectType } from "type-graphql";

import { TakenCourse } from "./takenCourse";

@ObjectType()
export class Term {
  // student_term => id
  @Field(() => Int)
  id: number;

  // student_term => student_id
  @Field()
  student_id: string;

  // student_term => year
  @Field(() => Int)
  year: number;

  // student_term => semester
  @Field()
  term: string; // 1-2-3 | first or second semester of the year, 3 if whole year

  // student_term => situation
  @Field()
  situation: string;

  // student_term => t_gpa
  @Field()
  PSP: number;

  // student_term => c_gpa
  @Field()
  PGA: number;

  // ?? // TODO Term ProgramPGA database definition
  @Field()
  ProgramPGA: number;

  // student_course => *
  @Field(() => [TakenCourse])
  takenCourses: TakenCourse[];
}
