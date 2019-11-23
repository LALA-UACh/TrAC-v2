import { Field, ID, Int, ObjectType, registerEnumType } from "type-graphql";

import { StateCourse } from "@constants";

import { Course } from "./course";
import { DistributionValue } from "./distribution";

registerEnumType(StateCourse, {
  name: "StateCourse",
  description: "Possible states of a taken course",
});

@ObjectType()
export class TakenCourse implements Pick<Course, "code" | "name"> {
  // student_course => id
  @Field(() => ID)
  id: string;

  // student_course => course_taken
  @Field()
  code: string;

  // course => name | helper field, probably isn't needed
  @Field()
  name: string;

  // student_course => registration
  @Field()
  registration: string;

  // student_course => grade
  @Field()
  grade: number;

  // student_course => state
  @Field(() => StateCourse)
  state: StateCourse;

  @Field(() => Int)
  parallelGroup: number;

  // ?? // TODO currentDistribution taken course database definition
  @Field(() => [DistributionValue])
  currentDistribution: DistributionValue[];
}
