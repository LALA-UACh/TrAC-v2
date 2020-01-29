import { toInteger } from "lodash";
import { Arg, Authorized, Ctx, Mutation, Resolver } from "type-graphql";

import {
  defaultPerformanceLoadUnit,
  defaultUserType,
  PROGRAM_NOT_FOUND,
  PROGRAM_UNAUTHORIZED,
  STUDENT_NOT_FOUND,
  UserType,
} from "../../../constants";
import { IContext } from "../../../interfaces";
import {
  PerformanceByLoadTable,
  StudentClusterTable,
  StudentProgramTable,
  UserProgramsTable,
} from "../../db/tables";
import { PerformanceByLoad } from "../../entities/data/foreplan";
import { anonService } from "../../utils/anonymization";
import { assertIsDefined } from "../../utils/assert";

@Resolver()
export class ForeplanResolver {
  @Authorized()
  @Mutation(() => [PerformanceByLoad])
  async performanceLoadAdvices(
    @Ctx() { user }: IContext,
    @Arg("student_id", {
      nullable: true,
    })
    student_id?: string,
    @Arg("program_id", {
      nullable: true,
    })
    program_id?: string
  ): Promise<PerformanceByLoad[]> {
    assertIsDefined(user, "Authorization in context is broken");
    if (defaultUserType(user.type) === UserType.Student) {
      student_id = await anonService.getAnonymousIdOrGetItBack(user.student_id);

      const studentProgram = await StudentProgramTable()
        .distinct("program_id", "curriculum", "start_year")
        .where({
          student_id,
        })
        .orderBy("start_year", "desc")
        .first();

      assertIsDefined(studentProgram, PROGRAM_NOT_FOUND);

      program_id = studentProgram.program_id;
    } else {
      assertIsDefined(student_id, STUDENT_NOT_FOUND);
      assertIsDefined(program_id, PROGRAM_NOT_FOUND);

      assertIsDefined(
        await UserProgramsTable()
          .select("program")
          .where({
            program: program_id,
            email: user.email,
          })
          .first(),
        PROGRAM_UNAUTHORIZED
      );

      student_id = await anonService.getAnonymousIdOrGetItBack(student_id);

      assertIsDefined(
        await StudentProgramTable()
          .select("program_id", "student_id")
          .where({
            student_id,
            program_id,
          })
          .first(),
        STUDENT_NOT_FOUND
      );
    }

    const student_cluster =
      (
        await StudentClusterTable()
          .select("cluster")
          .where({
            student_id,
            program_id,
          })
          .first()
      )?.cluster ?? 0;

    const performancesByLoad = await PerformanceByLoadTable()
      .select("*")
      .where({
        program_id,
        student_cluster,
      });

    return performancesByLoad.map(
      ({
        id,
        courseload_lb,
        courseload_ub,
        courseload_unit,
        hp_value,
        mp_value,
        lp_value,
        message_title,
        message_text,
        label,
      }) => {
        return {
          id,
          loadUnit: defaultPerformanceLoadUnit(courseload_unit),
          lowerBoundary: courseload_lb,
          upperBoundary: courseload_ub,
          failRateLow: toInteger(hp_value * 100),
          failRateMid: toInteger(mp_value * 100),
          failRateHigh: toInteger(lp_value * 100),
          adviceTitle: message_title,
          adviceParagraph: message_text,
          label,
        };
      }
    );
  }
}
