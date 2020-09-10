import {
  ArgsType,
  Field,
  Int,
  ObjectType,
  registerEnumType,
} from "type-graphql";

import { PerformanceLoadUnit } from "../../../client/constants";
import { Course } from "./course";

registerEnumType(PerformanceLoadUnit, {
  name: "PerformanceLoadUnit",
  description: "Unit used to distinguish load in the foreplan",
});

@ObjectType()
export class PerformanceByLoad {
  // performance_by_load => id
  @Field(() => Int)
  id: number;

  // performance_by_load => courseload_unit
  @Field(() => PerformanceLoadUnit)
  loadUnit: PerformanceLoadUnit;

  // performance_by_load => courseload_lb
  @Field()
  lowerBoundary: number;

  // performance_by_load => courseload_ub
  @Field()
  upperBoundary: number;

  // performance_by_load => hp_value * 100
  @Field(() => Int)
  failRateLow: number;

  // performance_by_load => mp_value * 100
  @Field(() => Int)
  failRateMid: number;

  // performance_by_load => lp_value * 100
  @Field(() => Int)
  failRateHigh: number;

  // performance_by_load => message_title
  @Field()
  adviceTitle: string;

  // performance_by_load => message_text
  @Field()
  adviceParagraph: string;

  // performance_by_load => label
  @Field()
  clusterLabel: string;

  // performance_by_load ~ student_cluster
  @Field()
  isStudentCluster: boolean;
}

@ArgsType()
export class ForeplanInput {
  @Field({ nullable: true })
  student_id?: string;

  @Field({ nullable: true })
  program_id?: string;
}

@ObjectType()
export class IndirectTakeCourse {
  @Field(() => Course)
  course: Course;

  @Field(() => [String])
  requisitesUnmet: string[];
}
