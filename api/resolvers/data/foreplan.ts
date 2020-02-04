import { toInteger, trim } from "lodash";
import { Args, Authorized, Ctx, Mutation, Resolver } from "type-graphql";

import {
  defaultPerformanceLoadUnit,
  defaultUserType,
  PROGRAM_NOT_FOUND,
  PROGRAM_UNAUTHORIZED,
  STUDENT_NOT_FOUND,
  UserType,
} from "../../../constants";
import { IContext } from "../../../interfaces";
import { StudentLastProgramDataLoader } from "../../dataloaders/student";
import {
  IUser,
  PerformanceByLoadTable,
  ProgramStructureTable,
  StudentClusterTable,
  StudentCourseTable,
  StudentProgramTable,
  UserProgramsTable,
} from "../../db/tables";
import { Course } from "../../entities/data/course";
import { ForeplanInput, PerformanceByLoad } from "../../entities/data/foreplan";
import { anonService } from "../../utils/anonymization";
import { assertIsDefined } from "../../utils/assert";
import { PartialCourse } from "./course";

@Resolver()
export class ForeplanResolver {
  static async authorizationProcess(
    user: IUser,
    dataArgs: { student_id?: string; program_id?: string } = {}
  ): Promise<{ program_id: string; student_id: string; curriculum: string }> {
    let student_id: string;
    let program_id: string;
    let curriculum: string;
    if (defaultUserType(user.type) === UserType.Student) {
      student_id = await anonService.getAnonymousIdOrGetItBack(user.student_id);

      const studentProgram = await StudentLastProgramDataLoader.load(
        student_id
      );

      assertIsDefined(studentProgram, PROGRAM_NOT_FOUND);

      program_id = studentProgram.program_id;
      curriculum = studentProgram.curriculum;
    } else {
      assertIsDefined(dataArgs.student_id, STUDENT_NOT_FOUND);
      assertIsDefined(dataArgs.program_id, PROGRAM_NOT_FOUND);

      assertIsDefined(
        await UserProgramsTable()
          .select("program")
          .where({
            program: dataArgs.program_id,
            email: user.email,
          })
          .first(),
        PROGRAM_UNAUTHORIZED
      );

      student_id = await anonService.getAnonymousIdOrGetItBack(
        dataArgs.student_id
      );

      const studentProgram = await StudentProgramTable()
        .select("program_id", "curriculum")
        .where({
          student_id,
          program_id: dataArgs.program_id,
        })
        .orderBy("start_year", "desc")
        .first();
      assertIsDefined(studentProgram, STUDENT_NOT_FOUND);

      program_id = studentProgram.program_id;
      curriculum = studentProgram.curriculum;
    }

    return { student_id, program_id, curriculum };
  }

  @Authorized()
  @Mutation(() => [PerformanceByLoad])
  async performanceLoadAdvices(
    @Ctx() { user }: IContext,
    @Args() input: ForeplanInput
  ): Promise<PerformanceByLoad[]> {
    assertIsDefined(user, "Authorization in context is broken");

    const {
      student_id,
      program_id,
    } = await ForeplanResolver.authorizationProcess(user, input);

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
      .where({ program_id });

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
        student_cluster: rowStudentCluster,
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
          isStudentCluster: rowStudentCluster === student_cluster,
        };
      }
    );
  }

  @Authorized()
  @Mutation(() => [Course])
  async directTakeCourses(
    @Ctx() { user }: IContext,
    @Args() input: ForeplanInput
  ): Promise<PartialCourse[]> {
    assertIsDefined(user, "User context is not working properly");

    const {
      student_id,
      program_id,
      curriculum,
    } = await ForeplanResolver.authorizationProcess(user, input);

    const allCoursesOfProgramCurriculum = (
      await ProgramStructureTable()
        .select("id", "course_id", "requisites")
        .where({
          program_id,
          curriculum,
        })
    ).map(({ id, course_id, requisites }) => {
      return {
        code: course_id,
        requisites: requisites?.split(",").map(trim),
        id,
      };
    });

    const allApprovedCourses = (
      await StudentCourseTable()
        .select("course_taken", "course_equiv", "elect_equiv")
        .where({
          student_id,
          state: "A",
        })
    ).reduce<Record<string, boolean>>(
      (acum, { course_equiv, course_taken, elect_equiv }) => {
        if (elect_equiv) {
          acum[elect_equiv] = true;
        }
        if (course_equiv) {
          acum[course_equiv] = true;
        }
        if (course_taken) {
          acum[course_taken] = true;
        }
        return acum;
      },
      {}
    );

    return allCoursesOfProgramCurriculum.reduce<PartialCourse[]>(
      (acum, { id, code, requisites }) => {
        if (
          requisites.every(requisiteCourseCode => {
            return allApprovedCourses[requisiteCourseCode] || false;
          })
        ) {
          acum.push({
            id,
            code,
          });
        }
        return acum;
      },
      []
    );
  }
}
