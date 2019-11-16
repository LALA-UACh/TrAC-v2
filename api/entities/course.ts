import { Field, ObjectType, registerEnumType } from "type-graphql";

import { StateCourse } from "@constants";

registerEnumType(StateCourse, {
  name: "StateCourse",
  description: "Possible states of a taken course"
});

@ObjectType()
export class Semester {
  @Field()
  year: number;

  @Field()
  semester: number;
}

@ObjectType()
export class DistributionValue {
  @Field()
  min: number;

  @Field()
  max: number;

  @Field()
  value: number;
}

@ObjectType()
export class State {
  @Field(() => StateCourse)
  state: StateCourse;
}

@ObjectType()
export class TakenCourse {
  @Field()
  registration: string;

  @Field()
  grade: number;

  @Field()
  state: State;

  @Field(() => [State])
  historicalStates: State[];

  @Field(() => [Semester])
  taken: Semester[];

  @Field(() => [DistributionValue])
  currentDistribution: DistributionValue[];
}

@ObjectType()
export class Course {
  @Field()
  code: string;

  @Field()
  name: string;

  @Field()
  credits: number;

  @Field()
  mention: string;

  @Field(() => [Course])
  flow: Course[];

  @Field(() => [Course])
  requisites: Course[];

  @Field(() => [DistributionValue])
  historicalDistribution: DistributionValue[];

  @Field({ nullable: true })
  takenInfo?: TakenCourse;
}
