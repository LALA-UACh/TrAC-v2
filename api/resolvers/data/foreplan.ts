import { Args, Authorized, Ctx, Mutation, Resolver } from "type-graphql";

import {
  defaultUserType,
  PROGRAM_NOT_FOUND,
  PROGRAM_UNAUTHORIZED,
  STUDENT_NOT_FOUND,
  UserType,
} from "../../../client/constants";
import {
  AllApprovedCoursesDataLoader,
  AllCoursesOfProgramCurriculumDataLoader,
  PerformanceLoadAdvicesDataLoader,
} from "../../dataloaders/foreplan";
import { StudentLastProgramDataLoader } from "../../dataloaders/student";
import { IUser, StudentProgramTable, UserProgramsTable } from "../../db/tables";
import { Course } from "../../entities/data/course";
import {
  ForeplanInput,
  IndirectTakeCourse,
  PerformanceByLoad,
} from "../../entities/data/foreplan";
import { anonService } from "../../services/anonymization";
import { assertIsDefined } from "../../utils/assert";

import type { IContext, IfImplements } from "../../../interfaces";
import type { PartialCourse } from "./course";

@Resolver()
export class ForeplanResolver {
  static async authorizationProcess(
    user: IUser,
    dataArgs: { student_id?: string; program_id?: string } = {}
  ): Promise<{
    program_id: string;
    student_id: string;
    curriculum: string;
  }> {
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

    return {
      student_id,
      program_id,
      curriculum,
    };
  }

  @Authorized()
  @Mutation(() => [PerformanceByLoad])
  async performanceLoadAdvices(
    @Ctx() { user, UserConfigDataLoader }: IContext,
    @Args() input: ForeplanInput
  ): Promise<PerformanceByLoad[]> {
    assertIsDefined(user, "Authorization in context is broken");

    const userConfig = (await UserConfigDataLoader.load(user.email))?.config;

    if (!userConfig?.FOREPLAN) {
      return [];
    }

    const {
      student_id,
      program_id,
    } = await ForeplanResolver.authorizationProcess(user, input);

    return await PerformanceLoadAdvicesDataLoader.load({
      student_id,
      program_id,
    });
  }

  @Authorized()
  @Mutation(() => [Course])
  async directTakeCourses(
    @Ctx() { user, UserConfigDataLoader }: IContext,
    @Args() input: ForeplanInput
  ): Promise<PartialCourse[]> {
    assertIsDefined(user, "User context is not working properly");

    const userConfig = (await UserConfigDataLoader.load(user.email))?.config;

    if (!userConfig?.FOREPLAN) {
      return [];
    }

    const {
      student_id,
      program_id,
      curriculum,
    } = await ForeplanResolver.authorizationProcess(user, input);

    const allCoursesOfProgramCurriculum = await AllCoursesOfProgramCurriculumDataLoader.load(
      { curriculum, program_id }
    );

    const allApprovedCourses = await AllApprovedCoursesDataLoader.load(
      student_id
    );

    return allCoursesOfProgramCurriculum.reduce<PartialCourse[]>(
      (acum, { id, code, requisites }) => {
        if (
          requisites.every((requisiteCourseCode) => {
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

  @Authorized()
  @Mutation(() => [IndirectTakeCourse])
  async indirectTakeCourses(
    @Ctx() { user, UserConfigDataLoader }: IContext,
    @Args() input: ForeplanInput
  ): Promise<
    IfImplements<
      { course: PartialCourse; requisitesUnmet: string[] },
      IndirectTakeCourse
    >[]
  > {
    assertIsDefined(user, "User context is not working properly");

    const userConfig = (await UserConfigDataLoader.load(user.email))?.config;
    if (
      !userConfig?.FOREPLAN ||
      !userConfig.FOREPLAN_FUTURE_COURSE_PLANIFICATION
    ) {
      return [];
    }

    const {
      student_id,
      program_id,
      curriculum,
    } = await ForeplanResolver.authorizationProcess(user, input);

    const allCoursesOfProgramCurriculum = await AllCoursesOfProgramCurriculumDataLoader.load(
      { curriculum, program_id }
    );

    const allApprovedCourses = await AllApprovedCoursesDataLoader.load(
      student_id
    );

    const indirectTakeCourses = allCoursesOfProgramCurriculum.reduce<
      {
        course: PartialCourse;
        requisitesUnmet: string[];
      }[]
    >((acum, { id, code, requisites }) => {
      if (
        requisites.some((requisiteCourseCode) => {
          return !allApprovedCourses[requisiteCourseCode];
        })
      ) {
        acum.push({
          course: { id, code },
          requisitesUnmet: requisites.reduce<string[]>(
            (acum, requisiteCourseCode) => {
              if (!allApprovedCourses[requisiteCourseCode]) {
                acum.push(requisiteCourseCode);
              }
              return acum;
            },
            []
          ),
        });
      }
      return acum;
    }, []);

    return indirectTakeCourses;
  }
}
