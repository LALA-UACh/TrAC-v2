import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Query,
  Resolver,
  Root,
} from "type-graphql";

import { IContext } from "../../interfaces";
import {
  StudentDropoutTable,
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
  @Query(() => Student, {
    nullable: true,
  })
  async student(
    @Ctx() { user }: IContext,
    @Arg("student_id")
    id: string,
    @Arg("program_id", {
      nullable: true,
    })
    program_id?: string
  ): Promise<PartialStudent | undefined> {
    assertIsDefined(user, `Error on authorization context`);

    if (!user.admin) {
      const AuthenticatedUserPrograms = await UserProgramsTable()
        .select("program")
        .where(
          program_id
            ? {
                email: user.email,
                program: program_id,
              }
            : {
                email: user.email,
              }
        );

      const IsAuthorized = await StudentTermTable()
        .select("student_id")
        .where("student_id", id)
        .whereIn(
          "program_id",
          AuthenticatedUserPrograms.map(({ program }) => program)
        )
        .first();

      assertIsDefined(
        IsAuthorized,
        `You are not authorized to check the specified student or program!`
      );
    }

    const studentData = await StudentTable()
      .select("name", "state")
      .where({
        id,
      })
      .first();

    if (studentData) {
      return {
        id,
        name: studentData.name,
        state: studentData.state,
        programs: program_id !== undefined ? [{ id: program_id }] : undefined,
      };
    }

    return undefined;
  }

  @FieldResolver()
  async programs(
    @Root() { id, programs }: PartialStudent
  ): Promise<PartialProgram[]> {
    if (programs) {
      return programs;
    }

    return (
      await StudentTermTable()
        .distinct("program_id")
        .where({ student_id: id })
    ).map(({ program_id }) => {
      return {
        id: program_id,
      };
    });
  }

  @FieldResolver()
  async terms(@Root() { id }: PartialStudent): Promise<PartialTerm[]> {
    assertIsDefined(
      id,
      `student id needs to be available for Student field resolvers`
    );

    return await StudentTermTable()
      .select("id")
      .where({ student_id: id });
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
