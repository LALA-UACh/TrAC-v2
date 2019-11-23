import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Int,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { $PropertyType } from "utility-types";

import { ADMIN } from "@consts";
import {
  CourseTable,
  ProgramStructureTable,
  ProgramTable,
  UserProgramsTable,
} from "@db/tables";
import { Course } from "@entities/course";
import { Program } from "@entities/program";
import { IContext } from "@interfaces";
import { ArrayPropertyType } from "@typings/utils";

@Resolver(() => Program)
export class ProgramResolver {
  @Authorized()
  @Query(() => Program, {
    nullable: true,
  })
  async program(
    @Arg("id", () => Int) id: number,
    @Ctx() { user }: IContext
  ): Promise<Pick<Program, "id" | "name" | "desc" | "state"> | undefined> {
    if (
      user === undefined ||
      (await UserProgramsTable.select("program")
        .where({
          program: id,
          email: user.email,
        })
        .first()) === undefined
    ) {
      throw new Error("You are not allowed to request this program!");
    }

    return await ProgramTable.select("id", "name", "desc", "state")
      .where({ id })
      .first();
  }

  @Authorized([ADMIN])
  @Query(() => [Program])
  async programs() {
    return await ProgramTable.select("id");
  }

  @Authorized()
  @Query(() => [Program])
  async myPrograms(@Ctx() { user }: IContext): Promise<Pick<Program, "id">[]> {
    return (
      await UserProgramsTable.select("program").where({
        email: user?.email,
      })
    ).map(({ program }) => ({
      id: parseInt(program, 10),
    }));
  }

  @FieldResolver()
  async name(
    @Root()
    { name, id }: Partial<Program>
  ): Promise<$PropertyType<Program, "name">> {
    return (
      name ??
      (
        await ProgramTable.select("name")
          .where({ id })
          .first()
      )?.name ??
      (() => {
        throw new Error(`Name could not be found for program ${id}`);
      })()
    );
  }

  @FieldResolver()
  async desc(
    @Root()
    { desc, id }: Partial<Program>
  ): Promise<$PropertyType<Program, "desc">> {
    return (
      desc ??
      (
        await ProgramTable.select("desc")
          .where({ id })
          .first()
      )?.desc ??
      (() => {
        throw new Error(`Description could not be found for program ${id}`);
      })()
    );
  }

  @FieldResolver()
  async state(
    @Root()
    { state, id }: Partial<Program>
  ): Promise<$PropertyType<Program, "state">> {
    return (
      state ??
      (
        await ProgramTable.select("state")
          .where({ id })
          .first()
      )?.state ??
      (() => {
        throw new Error(`State could not be found for program ${id}`);
      })()
    );
  }

  @FieldResolver()
  async courses(
    @Root()
    { id: program_id }: Pick<Program, "id">
  ): Promise<
    Pick<
      ArrayPropertyType<Program, "courses">,
      "semester" | "code" | "credits" | "requisitesRaw" | "mention"
    >[]
  > {
    const data = await ProgramStructureTable.select(
      "semester",
      "code",
      "credits",
      "requisites",
      "mention",
      "creditsSCT"
    ).where({ program_id }); // TODO: Fix query

    return data.map(
      ({ semester, code, credits, requisites, mention, creditsSCT }) => {
        if (
          semester &&
          code &&
          credits &&
          requisites &&
          mention &&
          creditsSCT
        ) {
          return {
            semester,
            code,
            credits: [
              { label: "Credits", value: credits },
              { label: "SCT", value: creditsSCT },
            ],
            requisitesRaw: requisites,
            mention,
          };
        }
        throw new Error(
          "Unexpected null! " +
            JSON.stringify({
              semester,
              code,
              credits,
              requisites,
              mention,
            })
        );
      }
    );
  }
}

@Resolver(() => Course)
export class CourseResolver {
  @FieldResolver()
  async name(
    @Root()
    { code }: Pick<Course, "code">
  ): Promise<$PropertyType<Course, "name">> {
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
  async flow(): Promise<$PropertyType<Course, "flow">> {
    // TODO Courses flow resolver
    return [];
  }

  @FieldResolver()
  async requisites(): Promise<$PropertyType<Course, "requisites">> {
    // TODO Courses requisites resolver
    return [];
  }

  @FieldResolver()
  async historicalDistribution(): Promise<
    $PropertyType<Course, "historicalDistribution">[]
  > {
    // TODO Courses historical distribution resolver
    return [];
  }
}
