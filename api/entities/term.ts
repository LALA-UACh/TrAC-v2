import { Field, Int, ObjectType, registerEnumType } from "type-graphql";

import { TermType } from "@constants";

import { TakenCourse } from "./takenCourse";

registerEnumType(TermType, {
  name: "TermType",
  description:
    "Possible states of a term, first semester, second semester or anual",
});

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
  @Field(() => TermType)
  term: TermType;

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
