import { Field, Int, ObjectType, registerEnumType } from "type-graphql";

import { StateCourse } from "../../constants";
import { Course } from "./course";
import { DistributionValue } from "./distribution";

registerEnumType(StateCourse, {
  name: "StateCourse",
  description: "Possible states of a taken course",
});

@ObjectType()
export class TakenCourse implements Pick<Course, "code" | "name"> {
  // student_course => id
  @Field(() => Int)
  id: number;

  // TODO: Course equivalent logic
  // student_course => course_taken | student_course => course_equiv | student_course => elect_equiv
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

  // student_course => p_group
  @Field(() => Int)
  parallelGroup: number;

  // course_stats => histogram , histogram_labels
  @Field(() => [DistributionValue])
  currentDistribution: DistributionValue[];
}
