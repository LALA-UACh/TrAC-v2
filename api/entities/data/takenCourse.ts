import { Field, Int, ObjectType, registerEnumType } from "type-graphql";

import { StateCourse } from "../../../constants";
import { BandColor, DistributionValue } from "./distribution";

import type { Course } from "./course";
registerEnumType(StateCourse, {
  name: "StateCourse",
  description: "Possible states of a taken course",
});

@ObjectType({ simpleResolvers: true })
export class TakenCourse implements Pick<Course, "code" | "name"> {
  // student_course => id
  @Field(() => Int)
  id: number;

  // student_course => course_taken
  @Field()
  code: string;

  // student_course => course_equiv | course_equiv
  @Field()
  equiv: string;

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

  // student_course => p_group
  @Field(() => Int)
  parallelGroup: number;

  // course_stats => histogram , histogram_labels
  @Field(() => [DistributionValue])
  currentDistribution: DistributionValue[];

  // LOGIC, CHOOSE ACCORDINGLY => course_stats => color_bands
  @Field(() => [BandColor])
  bandColors: BandColor[];
}
