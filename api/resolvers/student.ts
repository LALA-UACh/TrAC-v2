import {
  Arg,
  Authorized,
  FieldResolver,
  Int,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { $PropertyType } from "utility-types";

import { CourseTable, StudentProgramTable } from "@db/tables";
import { Student } from "@entities/student";
import { TakenCourse } from "@entities/takenCourse";
import { Term } from "@entities/term";

@Resolver(() => Student)
export class StudentResolver {
  @Authorized()
  @Query(() => Student, {
    nullable: true,
  })
  async student(
    @Arg("student_id")
    student_id: string,
    @Arg("program_id", () => Int, {
      nullable: true,
    })
    program_id?: number
  ) {
    const data = await StudentProgramTable.select(
      "program_id",
      "curriculum",
      "start_year",
      "mention"
    )
      .where({
        student_id,
        program_id,
      })
      .orderBy("start_year", "desc")
      .first();

    if (data) {
      const { program_id, curriculum, start_year, mention } = data;
      return {
        id: student_id,
        curriculum,
        start_year,
        mention,
        program: {
          id: program_id,
        },
      };
    }

    return undefined;
  }

  @FieldResolver()
  async terms(
    @Root() { id }: Pick<Student, "id">
  ): Promise<
    Pick<
      Term,
      | "id"
      | "student_id"
      | "year"
      | "semester"
      | "situation"
      | "PSP"
      | "PGA"
      | "ProgramPGA"
    >[]
  > {
    // TODO Student terms resolver
    return [];
  }

  @FieldResolver()
  async dropout(@Root() { id }: Pick<Student, "id">) {
    // TODO: Student dropout resolver
    return null;
  }
}

@Resolver(() => Term)
export class TermResolver {
  @FieldResolver()
  async takenCourses(
    @Root()
    { id, student_id }: Pick<Term, "id" | "student_id">
  ): Promise<
    Pick<TakenCourse, "id" | "code" | "registration" | "grade" | "state">[]
  > {
    // TODO Term taken courses resolver
    return [];
  }
}

@Resolver(() => TakenCourse)
export class TakenCourseResolver {
  @FieldResolver()
  async name(
    @Root()
    { code }: Pick<TakenCourse, "code">
  ): Promise<$PropertyType<TakenCourse, "name">> {
    return (
      (
        await CourseTable.select("name")
          .where({ code })
          .first()
      )?.name ??
      (() => {
        throw new Error(`Name not found for course ${code}`);
      })()
    );
  }

  @FieldResolver()
  async currentDistribution(
    @Root()
    { id, code }: Pick<TakenCourse, "id" | "code">
  ): Promise<$PropertyType<TakenCourse, "currentDistribution">[]> {
    // TODO Taken course current distribution resolver
    return [];
  }
}
