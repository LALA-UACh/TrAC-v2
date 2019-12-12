import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Resolver,
  Root,
} from "type-graphql";
import { $PropertyType } from "utility-types";

import { IContext } from "../../interfaces";
import {
  StudentDropoutTable,
  StudentProgramTable,
  StudentTable,
  StudentTermTable,
  UserProgramsTable,
} from "../db/tables";
import { Dropout } from "../entities/dropout";
import { Student } from "../entities/student";
import { assertIsDefined } from "../utils";
import { PartialProgram } from "./program";
import { PartialTerm } from "./term";

export type PartialStudent = Pick<Student, "id" | "name" | "state"> & {
  programs?: PartialProgram[];
};
@Resolver(() => Student)
export class StudentResolver {
  @Authorized()
  @Mutation(() => Student, { nullable: true })
  async student(
    @Ctx() { user }: IContext,
    @Arg("student_id")
    student_id: string,
    @Arg("program_id")
    program_id: string
  ): Promise<PartialStudent | null> {
    assertIsDefined(user, `Error on authorization context`);

    if (student_id === "") {
      return null;
    }

    const AuthenticatedUserPrograms = await UserProgramsTable()
      .select("program")
      .where({
        email: user.email,
        program: program_id,
      });
    //TODO: Optimize in a single query

    const IsAuthorized = await StudentProgramTable()
      .select("student_id")
      .where({ student_id })
      .whereIn(
        "program_id",
        AuthenticatedUserPrograms.map(({ program }) => program)
      )
      .first();

    assertIsDefined(
      IsAuthorized,
      `No tiene autorización para visualizar el estudiante especificado o el estudiante no pudo ser encontrado!`
    );

    const studentData = await StudentTable()
      .select("name", "state")
      .where({
        id: student_id,
      })
      .first();

    assertIsDefined(studentData, `Estudiante no encontrado!`);

    return {
      id: student_id,
      name: studentData.name,
      state: studentData.state,
      programs: [{ id: program_id }],
    };
  }

  @FieldResolver()
  async programs(
    @Root() { id, programs }: PartialStudent
  ): Promise<PartialProgram[]> {
    if (programs) {
      return programs;
    }

    return (
      await StudentProgramTable()
        .distinct("program_id")
        .where({ student_id: id })
    ).map(({ program_id }) => {
      return {
        id: program_id,
      };
    });
  }

  @FieldResolver()
  async curriculums(
    @Root() { id }: PartialStudent
  ): Promise<$PropertyType<Student, "curriculums">> {
    return (
      await StudentTermTable()
        .distinct("curriculum")
        .where({
          student_id: id,
        })
    ).map(({ curriculum }) => curriculum);
  }

  @FieldResolver()
  async start_year(
    @Root() { id }: PartialStudent
  ): Promise<$PropertyType<Student, "start_year">> {
    return (
      (
        await StudentProgramTable()
          .select("start_year")
          .orderBy("start_year", "desc")
          .where({ student_id: id })
          .first()
      )?.start_year ?? 0
    );
  }

  @FieldResolver()
  async mention(
    @Root() { id }: PartialStudent
  ): Promise<$PropertyType<Student, "mention">> {
    return (
      (
        await StudentProgramTable()
          .select("mention")
          .orderBy("year", "desc")
          .where({ student_id: id })
          .first()
      )?.mention ?? ""
    );
  }

  @FieldResolver()
  async terms(
    @Root() { id, programs }: PartialStudent
  ): Promise<PartialTerm[]> {
    assertIsDefined(
      id,
      `student id needs to be available for Student field resolvers`
    );

    if (!programs) {
      programs = (
        await StudentTermTable()
          .distinct("program_id")
          .where({ student_id: id })
      ).map(({ program_id }) => {
        return { id: program_id };
      });
    }

    return await StudentTermTable()
      .select("id")
      .where({ student_id: id })
      .whereIn(
        "program_id",
        programs.map(({ id }) => id)
      )
      .orderBy([
        { column: "year", order: "desc" },
        { column: "term", order: "desc" },
      ]);
  }

  @FieldResolver()
  async dropout(@Root() { id }: PartialStudent): Promise<Dropout | undefined> {
    assertIsDefined(
      id,
      `student id needs to be available for Student field resolvers`
    );

    return await StudentDropoutTable()
      .select("*")
      .where({ student_id: id })
      .first();
  }
}
